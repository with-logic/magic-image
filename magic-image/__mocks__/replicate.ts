import { vi } from "vitest";

export const mockRun: ReturnType<typeof vi.fn> = vi
  .fn()
  .mockResolvedValue(["https://example.com/generated.jpg"]);

const Replicate: ReturnType<typeof vi.fn> = vi
  .fn()
  .mockImplementation(function () {
    return { run: mockRun };
  });

export default Replicate;
