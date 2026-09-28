import useLagosTime from "../hooks/useLagosTime";

/* The Lagos time, as it appears in the header, the mobile menu and the contact panel. */
export default function Clock() {
  const time = useLagosTime();
  return <b data-clock="">{time}</b>;
}
