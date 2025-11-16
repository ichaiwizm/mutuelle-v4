#!/bin/bash
cd "$(dirname "$0")/.."

echo "📊 Analyse des fixtures d'emails"
echo "================================="
echo ""

total_leads=0
multi_lead_count=0

for file in src/main/__tests__/fixtures/emails/*.json; do
  if [ -f "$file" ]; then
    count=$(grep -o "Transmission d[''']une fiche" "$file" | wc -l)
    basename=$(basename "$file")

    if [ "$count" -gt 1 ]; then
      printf "✨ %-20s %2d leads (MULTI-LEAD)\n" "$basename" "$count"
      multi_lead_count=$((multi_lead_count + 1))
    elif [ "$count" -eq 1 ]; then
      printf "   %-20s %2d lead\n" "$basename" "$count"
    else
      printf "⚠️  %-20s %2d leads (vide?)\n" "$basename" "$count"
    fi

    total_leads=$((total_leads + count))
  fi
done

echo ""
echo "================================="
echo "Total: $total_leads leads"
echo "Emails multi-leads: $multi_lead_count"
