import { defineConfig } from '@wagmi/cli'
import { actions, hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'out/generated.ts',
  plugins: [
    actions(),
    hardhat({
      project: '.',
      include: [
        '**/BackedCCIPReceiver.sol/**',
        '@openzeppelin/**/ERC20.sol/**',
      ]
    }),
    react()
  ],
})
