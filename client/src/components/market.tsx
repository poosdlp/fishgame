
interface MarketProps {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onBuy: () => void;
}

export default function Market({ name, price, quantity, image, onBuy }: MarketProps) {
  return (
    <div className="market">
      {image && <img src={image} alt={name} />}
      <h3>{name}</h3>
      <p>Price: ${price}</p>
      <p>In Stock: {quantity}</p>
      <button onClick={onBuy} disabled={quantity === 0}>
        {quantity === 0 ? "Owned" : "Buy"}
      </button>
    </div>
  );
}