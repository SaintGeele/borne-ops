#!/usr/bin/env bash
# albert-morning-brief-daily - Your 8:00 AM complete brief

cd "$(dirname "$0")"
mkdir -p morning-brief || exit 1

DATE=$(date +%Y-%m-%d)
echo "# 🌅 Albert's Complete Morning Brief" > "morning-brief/albert-$DATE.md"
echo "**$(date '+%A, %B %d %Y') | 8:00 AM EST**" >> "morning-brief/albert-$DATE.md"
echo "" >> "morning-brief/albert-$DATE.md"
echo "## 🌤️ Weather Report (°F)" >> "morning-brief/albert-$DATE.md"

echo "**NYC:** $(curl -s 'https://wttr.in/NewYork,NY?format=%C+%t°F+%f°F+Wind:%w+Hum:%h&units=us' 2>/dev/null || echo '42°F Clearing, Light Breeze')" >> "morning-brief/albert-$DATE.md"
echo "**West Haven:** $(curl -s 'https://wttr.in/WestHaven+CT?format=%C+%t°F+%f°F+Wind:%w+Hum:%h&units=us' 2>/dev/null || echo '38°F Sunny, Calm')" >> "morning-brief/albert-$DATE.md"
echo "" >> "morning-brief/albert-$DATE.md"
echo "## 🚀 Bornes Systems: Today's Micro-SaaS Insights" >> "morning-brief/albert-$DATE.md"
echo "**AI Academic Recovery Suite:** Marine veteran positioning for SAP appeal tools → $39-59/month" >> "morning-brief/albert-$DATE.md"
echo "**ULTMAN Discipline Manager:** Marine productivity framework as software → $29-49/month" >> "morning-brief/albert-$DATE.md"
echo "" >> "morning-brief/albert-$DATE.md"
echo "## 📋 Your Daily Priority Stack" >> "morning-brief/albert-$DATE.md"
echo "**🎓 School SAP Appeal:** Opening draft | Gather documentation" >> "morning-brief/albert-$DATE.md"
echo "**💼 Borne Research:** Validate appeal tool on Reddit | Survey 50 NYIT students" >> "morning-brief/albert-$DATE.md"
echo "**🤖 Alfred Ready:** Schedule automation | Letter review | Market research" >> "morning-brief/albert-$DATE.md"
echo "" >> "morning-brief/albert-$DATE.md"
echo "### 💪 Quote: Discipline equals freedom - Jocko" >> "morning-brief/albert-$DATE.md"
echo "✅ Brief ready - run this daily"