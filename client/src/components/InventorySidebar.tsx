
import type { Fishy } from '../types/fish';
import { Inventory } from './inventory';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  inventory: Fishy[];
}

export function InventorySidebar({ isOpen, onToggle, inventory }: Props) {
    return(
    
    <div className={`sidebar left ${isOpen ? "open" : "collapsed"}`}>
        {/* SINGLE TOGGLE TAB */}
        <div className="side-tab left-tab" onClick={onToggle}>
            {isOpen ? "◀" : "▶"}
        </div>

        {/* CONTENT */}
        {isOpen && (
        <>
            <h2>Inventory</h2>
            <Inventory />
        </>
        )}
    </div>
    );

}