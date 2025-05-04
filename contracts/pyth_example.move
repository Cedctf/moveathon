module pyth_example::main {
    use iota::clock::Clock;
    use pyth::price_info;
    use pyth::price_identifier;
    use pyth::price;
    use pyth::pyth;
    use pyth::price_info::PriceInfoObject;
    use iota::event;
    use std::vector;
  
    const E_INVALID_ID: u64 = 1;
    const E_PRICE_TOO_OLD: u64 = 2;
  
    struct PriceEvent has drop, copy {
        price_value: u64,
        decimals: i64,
        timestamp: u64
    }

    // Structure to store price data
    struct StoredPrice has drop, copy {
        symbol: vector<u8>,
        price_value: u64,
        decimals: i64,
        timestamp: u64
    }
    
    // Global storage for price data
    struct PriceStorage has key {
        prices: vector<StoredPrice>
    }
  
    // Initialize the price storage
    public fun initialize() {
        if (!exists<PriceStorage>(@pyth_price_example)) {
            move_to(@pyth_price_example, PriceStorage {
                prices: vector::empty<StoredPrice>()
            });
        }
    }
  
    // Read price from Pyth and store it
    public fun read_and_store_price(
        clock: &Clock,
        price_info_object: &PriceInfoObject,
        symbol: vector<u8>
    ): (u64, i64, u64) {
        let max_age = 60; // Maximum age of 60 seconds
        
        // Get price not older than max_age
        let price_struct = pyth::get_price_no_older_than(price_info_object, clock, max_age);
        
        // Get price details
        let price_value = price::get_price(&price_struct);
        let decimals = price::get_expo(&price_struct);
        let timestamp = price::get_timestamp(&price_struct);
        
        // Verify timestamp
        assert!(
            timestamp >= clock::timestamp_seconds(clock) - max_age,
            E_PRICE_TOO_OLD
        );
        
        // Store the price data
        if (exists<PriceStorage>(@pyth_price_example)) {
            let price_storage = borrow_global_mut<PriceStorage>(@pyth_price_example);
            
            // Create a new stored price
            let stored_price = StoredPrice {
                symbol,
                price_value: price_value as u64,
                decimals,
                timestamp
            };
            
            // Add to storage
            vector::push_back(&mut price_storage.prices, stored_price);
        };
        
        // Emit an event with the price data
        event::emit(PriceEvent {
            price_value: price_value as u64,
            decimals,
            timestamp
        });
        
        (price_value as u64, decimals, timestamp)
    }
    
    // Get the latest stored price for a symbol
    public fun get_latest_price(symbol: vector<u8>): (u64, i64, u64) {
        let price_storage = borrow_global<PriceStorage>(@pyth_price_example);
        let len = vector::length(&price_storage.prices);
        
        // Find the latest price for the given symbol
        let latest_timestamp = 0;
        let latest_price_value = 0;
        let latest_decimals = 0;
        
        let i = 0;
        while (i < len) {
            let stored_price = vector::borrow(&price_storage.prices, i);
            if (stored_price.symbol == symbol && stored_price.timestamp > latest_timestamp) {
                latest_timestamp = stored_price.timestamp;
                latest_price_value = stored_price.price_value;
                latest_decimals = stored_price.decimals;
            };
            i = i + 1;
        };
        
        (latest_price_value, latest_decimals, latest_timestamp)
    }
    
    // Get ETH price (for backward compatibility)
    public fun get_eth_price(
        clock: &Clock,
        price_info_object: &PriceInfoObject,
    ): (u64, i64, u64) {
        // Verify price feed ID (ETH/USD)
        let price_info = price_info::get_price_info_from_price_info_object(price_info_object);
        let price_id = price_identifier::get_bytes(&price_info::get_price_identifier(&price_info));
        
        // Verify we're using ETH/USD price feed
        assert!(
            price_id == x"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
            E_INVALID_ID
        );
        
        // Store with symbol "ETH/USD"
        read_and_store_price(clock, price_info_object, b"ETH/USD")
    }
} 