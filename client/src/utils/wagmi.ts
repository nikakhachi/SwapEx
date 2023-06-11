import { WriteContractUnpreparedArgs, waitForTransaction, writeContract } from "wagmi/actions";

export const writeContractAndWait = async (config: WriteContractUnpreparedArgs<any, any>) => {
  let hash: `0x${string}` | undefined;
  try {
    const data = await writeContract(config);
    hash = data.hash;
    await waitForTransaction({ hash });
  } catch (error: any) {
    if (hash) {
      try {
        // Wagmi library throws a BlockNotFoundError randomly on this function once in a while
        // Issue is open on their github, so before that's resolved I'll have empty catch here
        await waitForTransaction({ hash });
      } catch (error) {}
    }
  }
};
