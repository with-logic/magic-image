import { vi } from "vitest";

export const mockRun = vi
  .fn()
  .mockResolvedValue(["https://example.com/generated.jpg"]);

const Replicate = vi.fn().mockImplementation(() => ({
  run: mockRun,
}));

export default Replicate;
