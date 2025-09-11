# BackedCCIPReceiver Test Suite

This directory contains comprehensive tests for the BackedCCIPReceiver contract, covering the new SVM destination support and extensive edge cases.

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
- Auto fee token security scenarios
- Pause mechanism security
- Fund withdrawal security

#### 3. BackedCCIPReceiver.edge-cases.spec.ts
Edge cases and auto fee token scenarios:
- Extreme value testing (max uint256, min values)
- Auto fee token multiplier synchronization
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
- Large-scale operations testing
- Memory usage optimization

### Integration Tests (`/test/integration/`)

#### BackedCCIPReceiver.integration.spec.ts
Comprehensive cross-chain integration tests:
- EVM to EVM token transfers
- Auto fee token cross-chain transfers with multiplier sync
- Mixed chain variant integration (EVM to SVM simulation)
- High volume integration tests
- Error handling in integration environment
- Upgrade compatibility integration

### Legacy Tests

#### `/test/fork/BackedCCIPReceiver.spec.ts`
Original fork-based integration test for basic cross-chain functionality.

#### `/test/no-fork/BackedCCIPReceiver.spec.ts`
Original unit tests covering basic contract functionality.

## Key Features Tested

### SVM Support
- ✅ SVM chain registration with proper parameters
- ✅ SVM-specific extra args encoding (accountIsWritableBitmap, accounts array)
- ✅ Gas limit configuration for SVM chains
- ✅ Fee calculation differences between EVM and SVM
- ✅ Mixed chain variant scenarios

### Security
- ✅ Comprehensive access control validation
- ✅ Input sanitization and validation
- ✅ Reentrancy protection
- ✅ Message authentication and validation
- ✅ Pause mechanism functionality
- ✅ Secure fund management

### Edge Cases
- ✅ Extreme value handling (max/min values)
- ✅ Auto fee token multiplier edge cases
- ✅ Complex configuration scenarios
- ✅ Large payload handling
- ✅ Storage optimization scenarios

### Performance
- ✅ Gas usage optimization
- ✅ Batch operation efficiency
- ✅ Large-scale operation handling
- ✅ Memory usage optimization

### Integration
- ✅ End-to-end cross-chain transfers
- ✅ Multi-token scenarios
- ✅ Error recovery and graceful degradation
- ✅ Upgrade compatibility

## Running Tests

```bash
# Run all unit tests (no forking required)
npm run test:no-fork

# Run integration tests (requires forking)
npm run test:fork

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
- **Integration Tests**: Cross-chain scenarios with forking
- **Performance Tests**: Gas optimization and efficiency
- **Security Tests**: Access control and validation

### By Feature
- **SVM Support**: New Solana destination functionality
- **Auto Fee Tokens**: Multiplier-based rebasing tokens
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
- Multiple token types (regular and auto fee)
- Various chain configurations (EVM and SVM)
- Different transfer amounts and edge cases
- Realistic gas limits and fee structures
- Complex multiplier scenarios for auto fee tokens

## Notes

- SVM integration tests simulate SVM behavior since actual SVM chains may not be available in test environment
- Performance tests include gas usage reporting for optimization
- Security tests cover both positive and negative test cases
- Integration tests use Chainlink's local simulator for realistic CCIP behavior