import { dayKey, dayLabel, groupByCategory } from '../lib/format';

/**
 * One order printed for the kitchen with just the bare minimum: who it is for, when they
 * are collecting, and what needs making. Used when printing one order and when printing all.
 */
export default function PrintedOrder({ order }) {
  const day = dayLabel(dayKey(order.fulfillment_date));

  return (
    <article className="ticket">
      <header className="ticket-head">
        <div className="ticket-name">{order.notes || order.customer_email}</div>
        <div className="ticket-when">
          {order.fulfillment_time && <div className="ticket-time">{order.fulfillment_time}</div>}
          <div className="ticket-day">{day}</div>
        </div>
      </header>

      {(order.sandwiches || []).map((sandwich, i) => (
        <div key={sandwich.id || i} className="ticket-line">
          <span className="ticket-qty">{sandwich.quantity} ×</span>
          <div>
            <div className="ticket-make">{(sandwich.options || []).map(option => option.option_name).join(', ')}</div>
            {sandwich.notes && <div className="ticket-note">{sandwich.notes}</div>}
          </div>
        </div>
      ))}

      {(order.buffets || []).map((buffet, i) => (
        <div key={buffet.id || i} className="ticket-buffet">
          <div className="ticket-make">{buffet.buffet_name || 'Buffet'} for {buffet.num_people}</div>
          {buffet.dietary_info && <div className="ticket-note">Dietary: {buffet.dietary_info}</div>}
          {buffet.allergens && <div className="ticket-note">Allergens: {buffet.allergens}</div>}
          {buffet.notes && <div className="ticket-note">{buffet.notes}</div>}
          {Object.entries(groupByCategory(buffet.items)).map(([cat, items]) => (
            <div key={cat} className="ticket-buffet-items"><strong>{cat}:</strong> {items.map(item => item.item_name).join(', ')}</div>
          ))}
          {(buffet.upgrades || []).filter(u => u.upgrade_name).map((upgrade, ui) => (
            <div key={upgrade.id || ui} className="ticket-buffet-items">
              <strong>+ {upgrade.upgrade_name}</strong>
              {upgrade.selectedItems?.length > 0 && `: ${upgrade.selectedItems.map(item => item.item_name).join(', ')}`}
            </div>
          ))}
        </div>
      ))}
    </article>
  );
}
