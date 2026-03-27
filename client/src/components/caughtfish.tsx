// after player successfully catches fish, successful mini play, show fish stats, add fish to inventory and return to waiting for a bite.  
type Props = {
  onReset: () => void;
};  

export function CaughtFish({ onReset }: Props) {
  return (
    <div>
      <h2>Congratulations! You caught a fish!</h2>
      <button onClick={onReset}>Done</button>
    </div>
  );
}