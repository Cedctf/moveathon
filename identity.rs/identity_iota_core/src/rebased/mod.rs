// Copyright 2020-2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

/// Module for handling assets.
pub mod assets;
/// Module for handling client operations.
pub mod client;
mod error;
mod iota;
/// Module for handling migration operations.
pub mod migration;
/// Contains the operations of proposals.
pub mod proposals;
/// Module for handling transactions.
pub mod transaction;
/// Module for creating transactions using a builder style pattern.
pub mod transaction_builder;
/// Contains utility functions.
#[cfg(not(target_arch = "wasm32"))]
pub mod utils;

pub use assets::*;
pub use error::*;

/// Integration with IOTA's Keytool.
#[cfg(feature = "keytool")]
pub use identity_iota_interaction::keytool;
