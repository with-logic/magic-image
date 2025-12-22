import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NumberStepper } from "./NumberStepper";

const meta: Meta<typeof NumberStepper> = {
  title: "Components/NumberStepper",
  component: NumberStepper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "number",
    },
    min: {
      control: "number",
    },
    max: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function NumberStepperWithState({
  initialValue = 5,
  min = 1,
  max = 10,
}: {
  initialValue?: number;
  min?: number;
  max?: number;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <NumberStepper value={value} onChange={setValue} min={min} max={max} />
  );
}

export const Default: Story = {
  render: () => <NumberStepperWithState />,
};

export const AtMinimum: Story = {
  render: () => <NumberStepperWithState initialValue={1} min={1} max={10} />,
};

export const AtMaximum: Story = {
  render: () => <NumberStepperWithState initialValue={10} min={1} max={10} />,
};

export const CustomRange: Story = {
  render: () => <NumberStepperWithState initialValue={50} min={0} max={100} />,
};

export const SmallRange: Story = {
  render: () => <NumberStepperWithState initialValue={2} min={1} max={3} />,
};
