

const generateMockData = () => {
    const data = []
    const now = new Date()
    const basePrice = 2500000
  
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
  
      // Generate a random price with a slight upward trend
      const randomFactor = 0.98 + Math.random() * 0.04
      const price = basePrice * (1 + (30 - i) * 0.005) * randomFactor
  
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: Math.round(price),
        volume: Math.round(Math.random() * 500000 + 200000),
      })
    }
  
    return data
  }

export default function PriceChart() {
    return (
        <div>
            <h1>Price Chart</h1>
        </div>
    )
}
