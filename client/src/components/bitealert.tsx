// player hooked a fish, wait for the to either catch it or fail.
type Props = {
  onCatch: () => void;
};

export function BiteAlert({ onCatch }: Props) {
  return <button onClick={onCatch}>Catch Fish!</button>;
}