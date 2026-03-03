import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { EventWithDetails } from '../types/database';
import { calculateEventRequirements } from './eventLogic';

export const exportEventChecklist = async (event: EventWithDetails, allEquipment: any[] = []) => {
  const dateStr = format(parseISO(event.datetime), "eeee d MMMM yyyy 'ore' HH:mm", { locale: it });

  const reqs = calculateEventRequirements(
    event.menu_items.map(mi => ({ recipe: mi.recipe, portions: mi.portions })),
    event.people_count,
    event.type,
    allEquipment
  );

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica'; padding: 20px; color: #1A1A1A; }
          h1 { color: #005F02; margin-bottom: 5px; }
          .header { border-bottom: 2px solid #005F02; margin-bottom: 20px; padding-bottom: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; font-size: 18px; border-bottom: 1px solid #D1C8AC; margin-bottom: 10px; padding-bottom: 5px; color: #005F02; }
          .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #F2E3BB; }
          .item-label { flex: 1; }
          .item-qty { font-weight: bold; width: 120px; text-align: right; }
          .breakdown { font-size: 11px; color: #4A4A4A; margin-top: -3px; margin-bottom: 5px; }
          .notes-box { background-color: #F2E3BB; padding: 10px; border-radius: 8px; border-left: 4px solid #005F02; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Prep-Sheet: ${event.title}</h1>
          <p><strong>Data:</strong> ${dateStr}</p>
          <p><strong>Tipo:</strong> ${event.type === 'domicilio' ? 'A Domicilio' : 'Asporto'}</p>
          <p><strong>Persone:</strong> ${event.people_count}</p>
          ${event.address ? `<p><strong>Indirizzo:</strong> ${event.address}</p>` : ''}
        </div>

        ${event.notes ? `
        <div class="section">
          <div class="section-title">Note Evento</div>
          <div class="notes-box">${event.notes.replace(/\n/g, '<br/>')}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Menù</div>
          ${event.menu_items.map(mi => `
            <div class="item">
              <span class="item-label">${mi.recipe.name}</span>
              <span class="item-qty">${mi.portions} porzioni</span>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Ingredienti (Totale Serve)</div>
          ${Object.values(reqs.ingredientReqs).map(ing => `
            <div class="item">
              <span class="item-label">${ing.name}</span>
              <span class="item-qty">${ing.qty} ${ing.unit}</span>
            </div>
            <div class="breakdown">
              ${ing.breakdown.map(b => `${b.recipeName}: ${b.qty}${ing.unit}`).join(', ')}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Attrezzatura e Monouso</div>
          ${Object.values(reqs.equipmentReqs).map(eq => `
            <div class="item">
              <span class="item-label">${eq.name}</span>
              <span class="item-qty">${eq.qty} pz</span>
            </div>
            <div class="breakdown">
              ${eq.breakdown.map(b => `${b.reason}: ${b.qty}pz`).join(', ')}
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};

export const exportGlobalShoppingList = async (ingredients: any[], equipment: any[], plannedCount: number) => {
  const dateStr = format(new Date(), "eeee d MMMM yyyy", { locale: it });

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: 'Helvetica'; padding: 20px; color: #1A1A1A; }
          h1 { color: #427A43; margin-bottom: 5px; }
          .header { border-bottom: 2px solid #427A43; margin-bottom: 20px; padding-bottom: 10px; }
          .section-title { font-weight: bold; font-size: 18px; color: #427A43; margin-bottom: 10px; border-bottom: 1px solid #D1C8AC; }
          .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F2E3BB; }
          .item-label { flex: 1; font-weight: bold; }
          .item-detail { font-size: 11px; color: #4A4A4A; }
          .item-to-buy { color: #C62828; font-weight: bold; width: 100px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Lista della Spesa Totale</h1>
          <p><strong>Generata il:</strong> ${dateStr}</p>
          <p><strong>Eventi considerati:</strong> ${plannedCount}</p>
        </div>

        ${ingredients.length > 0 ? `
        <div class="section">
          <div class="section-title">Ingredienti da Acquistare</div>
          ${ingredients.map(ing => `
            <div class="item">
              <div class="item-label">
                ${ing.name}
                <div class="item-detail">Serve: ${ing.qty}${ing.unit} | In Stock: ${ing.inStock}${ing.unit}</div>
              </div>
              <div class="item-to-buy">${ing.toBuy.toFixed(2)} ${ing.unit}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${equipment.length > 0 ? `
        <div class="section">
          <div class="section-title">Materiali Monouso da Acquistare</div>
          ${equipment.map(eq => `
            <div class="item">
              <div class="item-label">
                ${eq.name}
                <div class="item-detail">Serve: ${eq.qty}pz | In Stock: ${eq.inStock}pz</div>
              </div>
              <div class="item-to-buy">${eq.toBuy} pz</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};
