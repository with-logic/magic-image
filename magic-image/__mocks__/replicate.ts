import type ReplicateClient from "replicate";
import { type Mock, vi } from "vitest";

export const mockRun: Mock<ReplicateClient["run"]> = vi
  .fn<ReplicateClient["run"]>()
  .mockResolvedValue(["https://example.com/generated.jpg"]);

const Replicate: Mock<typeof ReplicateClient> = vi
  .fn<typeof ReplicateClient>()
  .mockImplementation(function () {
    return { run: mockRun };
  });

export default Replicate;
