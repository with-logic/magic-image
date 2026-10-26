import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

for (const format of ["CommonJS", "ESM"]) {
  test(
    `Storybook ${format} actions reach the channel with UUID v4 IDs`,
    {
      timeout: 1_000,
    },
    async () => {
      const load = format === "CommonJS" ? require : (id) => import(id);
      const { Channel } = await load("storybook/internal/channels");
      const { addons } = await load("storybook/internal/preview-api");
      const { action, EVENT_ID } = await load("@storybook/addon-actions");
      const channel = new Channel({});
      addons.setChannel(channel);

      const received = new Promise((resolve) =>
        channel.once(EVENT_ID, resolve),
      );
      action("image selected")({ imageId: "smoke-test" }, "generated");
      const event = await received;

      assert.deepEqual(event.data, {
        name: "image selected",
        args: [{ imageId: "smoke-test" }, "generated"],
      });
      assert.match(
        event.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    },
  );
}
