declare module "replicate" {
  interface ReplicateOptions {
    auth: string;
  }

  interface RunOptions {
    input: Record<string, unknown>;
  }

  type ModelOutput =
    | string
    | string[]
    | { url: string }
    | Record<string, unknown>;

  class Replicate {
    constructor(options: ReplicateOptions);
    run(
      model: `${string}/${string}`,
      options: RunOptions,
    ): Promise<ModelOutput>;
  }

  export default Replicate;
}
