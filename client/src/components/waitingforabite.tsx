// after play button is clicked, begin waiting for casting a line and begin gameplay until bite.
type Props = {
  onFishBite: () => void;
};

export function WaitingForABite({ onFishBite }: Props) {
  return <button onClick={onFishBite}>Fish Bit!</button>;
}