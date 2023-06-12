import { WriteContractUnpreparedArgs, waitForTransaction, writeContract } from "wagmi/actions";

const TX_WAITING_TIME_MS = 60000;

export const writeContractAndWait = async (config: WriteContractUnpreparedArgs<any, any>) => {
  try {
    const { hash } = await writeContract(config);
    await waitForTransaction({ hash, timeout: TX_WAITING_TIME_MS });
  } catch (error: any) {}
};
