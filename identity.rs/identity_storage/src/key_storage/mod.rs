// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

//! A Key Storage is used to securely store private keys.
//!
//! This module provides the [`JwkStorage`] trait that
//! abstracts over storages that store JSON Web Keys.

#[cfg(feature = "jpt-bbs-plus")]
/// BLS12381 utils.
pub mod bls;
#[cfg(any(feature = "memstore", feature = "keytool"))]
mod ed25519;
mod jwk_gen_output;
mod jwk_storage;
#[cfg(feature = "jpt-bbs-plus")]
mod jwk_storage_bbs_plus_ext;
mod key_id;
mod key_storage_error;
mod key_type;
#[cfg(feature = "keytool")]
mod keytool;
#[cfg(feature = "memstore")]
mod memstore;
#[cfg(feature = "keytool")]
mod secp256k1;
#[cfg(feature = "keytool")]
mod secp256r1;

#[cfg(test)]
pub(crate) mod tests;

/// All modules that should be made available to end-users.
pub mod public_modules {
  pub use super::jwk_gen_output::*;
  pub use super::jwk_storage::*;
  #[cfg(feature = "jpt-bbs-plus")]
  pub use super::jwk_storage_bbs_plus_ext::*;
  pub use super::key_id::*;
  pub use super::key_storage_error::*;
  pub use super::key_type::*;
  #[cfg(feature = "memstore")]
  pub use super::memstore::*;
}

pub use public_modules::*;
