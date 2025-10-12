# BackedCCIPReceiver Test Suite

This directory contains comprehensive tests for the BackedCCIPReceiver contract, covering shares-based token transfers, SVM destination support, and extensive edge cases.

## Test Structure

### Unit Tests (`/test/unit/`)

#### 1. BackedCCIPReceiver.svm.spec.ts
Tests for SVM (Solana Virtual Machine) destination support:
- SVM chain registration and configuration
- SVM-specific message building with chain-specific arguments
- Gas limit management for SVM chains
- Cross-chain fee calculations for SVM destinations
- Mixed EVM/SVM chain scenarios
- Edge cases with large account arrays and complex configurations

#### 2. BackedCCIPReceiver.security.spec.ts
Comprehensive security test suite:
- Access control validation (owner-only functions)
- Input validation and sanitization
- Reentrancy protection testing
- CCIP message validation and authentication
- SVM chain security scenarios
- Token interface validation (shares-based requirements)
- Pause mechanism security
- Fund withdrawal security

#### 3. BackedCCIPReceiver.edge-cases.spec.ts
Edge cases and extreme value scenarios:
- Extreme value testing (max safe amounts, overflow protection)
- Maximum/minimum token amounts (1 wei to MaxUint256 / 1e18)
- Auto fee token scenarios
- Complex chain variant scenarios
- Token management edge cases
- Message data validation
- Upgrade compatibility

#### 4. BackedCCIPReceiver.performance.spec.ts
Performance and gas optimization tests:
- Gas usage analysis for different operations
- Batch operations performance
- Message processing efficiency
- Storage access optimization
- Large-scale operations testing (50+ chains, 100+ tokens)
- Memory usage optimization

### Integration Tests (`/test/integration/`)

#### BackedCCIPReceiver.integration.spec.ts
Comprehensive cross-chain integration tests:
- End-to-end auto fee token transfers using shares
- Auto fee token cross-chain transfers with different multipliers
- Mixed chain variant integration (EVM and SVM)
- Error recovery scenarios
- Upgrade compatibility integration

### Core Tests

#### `/test/fork/BackedCCIPReceiver.spec.ts`
Fork-based integration test for basic cross-chain functionality.

#### `/test/no-fork/BackedCCIPReceiver.spec.ts`
Unit tests covering basic contract functionality and message flow.

## Known Issues

**3 integration tests currently fail** due to a message encoding bug in the contract (line 356 sends both `_amount` and `_sharesAmount`, but receiver reads the wrong position). A bug documentation test is included. Contract fix is pending.

## Key Features Tested

### Shares-Based Architecture
- Shares calculation with getSharesByUnderlyingAmount()
- Shares transfer with transferSharesFrom()
- Economic value preservation across chains
- Maximum safe amounts (MaxUint256 / 1e18)
- Overflow protection validation

### Token Interface Requirements
- Only tokens with shares interface are supported
- Regular ERC20 tokens fail predictably (registration succeeds, operations fail)
- Auto fee token validation and operations

### SVM Support
- SVM chain registration with proper parameters
- SVM-specific extra args encoding (accountIsWritableBitmap, accounts array)
- Gas limit configuration for SVM chains
- Fee calculation differences between EVM and SVM
- Mixed chain variant scenarios
- DoS protection for excessive accounts arrays

### Security
- Comprehensive access control validation
- Input sanitization and validation
- Reentrancy protection
- Message authentication and validation
- Pause mechanism functionality
- Secure fund management

### Edge Cases
- Extreme value handling (max/min values)
- Arithmetic overflow protection
- Auto fee token edge cases
- Complex configuration scenarios
- Token/chain removal and re-registration
- Multiple simultaneous operations

### Performance
- Gas usage optimization
- Batch operation efficiency
- Large-scale operation handling
- Memory usage optimization
- Message size reduction (72 bytes vs old 137 bytes)

### Integration
- End-to-end cross-chain transfers with shares
- Multi-token scenarios
- Error recovery and graceful degradation
- Upgrade compatibility

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/unit/BackedCCIPReceiver.svm.spec.ts

# Run tests with gas reporting
REPORT_GAS=true npm test
```

## Test Categories

### By Test Type
- **Unit Tests**: Isolated contract functionality
- **Integration Tests**: Cross-chain scenarios
- **Performance Tests**: Gas optimization and efficiency
- **Security Tests**: Access control and validation

### By Feature
- **Shares Architecture**: Economic value preservation through shares
- **SVM Support**: Solana destination functionality
- **Token Interface**: Shares-based token requirements
- **Chain Management**: Multi-chain configuration
- **Token Management**: Registration and validation
- **Message Processing**: CCIP message handling

## Coverage Goals

The test suite aims for:
- **>95% Line Coverage**: All code paths tested
- **>90% Branch Coverage**: All conditional logic tested
- **100% Function Coverage**: All public/external functions tested
- **Edge Case Coverage**: Extreme values and error conditions
- **Integration Coverage**: End-to-end scenarios

## Test Data

Tests use realistic scenarios with:
- Auto fee tokens with shares interface
- Regular ERC20 tokens (for validation of rejection)
- Various chain configurations (EVM and SVM)
- Different transfer amounts (1 wei to MaxUint256 / 1e18)
- Realistic gas limits and fee structures
- Complex multiplier scenarios for auto fee tokens

## Notes

- Tests use shares-based message format: [tokenReceiver, tokenId, sharesAmount]
- All tokens must implement shares interface (getSharesByUnderlyingAmount, transferSharesFrom)
- SVM integration tests simulate SVM behavior since actual SVM chains may not be available in test environment
- Performance tests include gas usage reporting for optimization
- Security tests cover both positive and negative test cases
- Integration tests use Chainlink's local simulator for realistic CCIP behavior
