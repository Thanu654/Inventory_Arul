import  db from "../config/db.js";

export const seedItems = async () => {
  const items = [

    // ================== LIGHTING (10) ==================
    ["LED Bulb 12W", "Energy saving LED bulb", 120, 650, 550, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["LED Bulb 18W", "High brightness LED bulb", 90, 850, 720, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],

    ["Tube Light 4ft", "White tube light", 70, 1200, 980, "Lighting",
      "https://images.unsplash.com/photo-1441171205449-f600f908a9f3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVsYnxlbnwwfHwwfHx8MA%3D%3D", null],

    ["Ceiling Light", "Round ceiling panel", 60, 1850, 1550, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

    ["Emergency Light", "Rechargeable emergency light", 40, 4200, 3800, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],

    ["Street Light 50W", "Outdoor street light", 30, 12500, 11000, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["Spot Light", "Decorative spot light", 45, 2100, 1800, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

    ["Night Lamp", "Small night lamp", 85, 950, 750, "Lighting",
      "https://www.alarzelectrical.com/wp-content/uploads/2022/01/automatic-circuit-breakers-copper-single-core-cable-accessories-safe-secure-electrical-installation-equipment-protection-152752114.jpg", null],

    ["Flood Light 100W", "Outdoor flood light", 25, 14500, 13200, "Lighting",
      "https://images.unsplash.com/photo-1441171205449-f600f908a9f3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVsYnxlbnwwfHwwfHx8MA%3D%3D", null],

    ["Table Lamp", "Study table lamp", 55, 3200, 2800, "Lighting",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    // ================== ELECTRICAL (10) ==================
    ["Switch Socket", "Wall switch socket", 150, 350, 280, "Electrical",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlReqftnEN1qlr_E5JohuVnOjcbbaq_VkoLQ&s", null],

    ["MCB Breaker", "Mini circuit breaker", 60, 1850, 1600, "Electrical",
      "https://www.alarzelectrical.com/wp-content/uploads/2022/01/automatic-circuit-breakers-copper-single-core-cable-accessories-safe-secure-electrical-installation-equipment-protection-152752114.jpg", null],

    ["Power Strip", "Extension power strip", 90, 2200, 1950, "Electrical",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],

    ["Plug Top", "3 pin plug top", 200, 120, 95, "Electrical",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

    ["Fan Regulator", "Ceiling fan regulator", 50, 1450, 1200, "Electrical",
      "https://glocusent.com/cdn/shop/articles/default_name_b7d58ddc-58b2-476d-9942-742567c39ac4.webp?v=1762500645", null],

    ["Electric Wire 1mm", "Copper wire 1mm", 100, 4500, 4100, "Electrical",
      "https://www.alarzelectrical.com/wp-content/uploads/2022/01/automatic-circuit-breakers-copper-single-core-cable-accessories-safe-secure-electrical-installation-equipment-protection-152752114.jpg", null],

    ["Electric Wire 2.5mm", "Copper wire 2.5mm", 80, 7200, 6700, "Electrical",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],

    ["Switch Board", "6 switch board", 70, 850, 720, "Electrical",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["Indicator Light", "Panel indicator light", 110, 180, 130, "Electrical",
      "https://thumbs.dreamstime.com/b/light-bulb-brain-inside-hands-businessman-concept-business-idea-light-bulb-brain-inside-hands-106231544.jpg", null],

    ["Adapter Plug", "Mobile charger adapter", 95, 1700, 1500, "Electrical",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

    // ================== PLUMBING (10) ==================
    ["PVC Pipe 1 inch", "Water pipe", 140, 420, 350, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],

    ["PVC Pipe 2 inch", "Large water pipe", 90, 820, 720, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["Water Tap", "Metal water tap", 110, 950, 800, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

    ["Shower Head", "Bathroom shower head", 70, 1850, 1600, "Plumbing",
      "https://images.unsplash.com/photo-1441171205449-f600f908a9f3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnVsYnxlbnwwfHwwfHx8MA%3D%3D", null],

    ["Ball Valve", "PVC ball valve", 85, 720, 600, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["Flexible Hose", "Water hose pipe", 120, 550, 450, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],

    ["Sink Pipe", "Sink drainage pipe", 65, 980, 850, "Plumbing",
      "https://thumbs.dreamstime.com/b/light-bulb-brain-inside-hands-businessman-concept-business-idea-light-bulb-brain-inside-hands-106231544.jpg", null],

    ["Water Filter", "Home water filter", 40, 8200, 7500, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

    ["Flush Tank", "Toilet flush tank", 30, 16500, 15000, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["Pipe Elbow", "PVC elbow joint", 200, 120, 90, "Plumbing",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],
    // ================== TOOL (02) ==================
    ["Flush Tank", "Toilet flush tank", 30, 16500, 15000, "TOOL",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6R9_m2MaZ0aLNst3AmmEP1kM3J0mZj1WjkA&s", null],

    ["Pipe Elbow", "PVC elbow joint", 200, 1200, 95, "TOOL",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpqaDgWxyNAI0t2ytSGz0N7GeNxPpJMjALnw&s", null],
    // ================== Hardware (02) ==================
     ["Indicator Light", "Panel indicator light", 120, 1000, 140, "Hardware",
      "https://thumbs.dreamstime.com/b/light-bulb-brain-inside-hands-businessman-concept-business-idea-light-bulb-brain-inside-hands-106231544.jpg", null],

    ["Adapter Plug", "Mobile charger adapter", 95, 1700, 1600, "Hardware",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHGWRAO6QebMRwufnclLnq5lDX3pqD_HhuuQ&s", null],

  ];

  for (const item of items) {
    await db.query(
      `INSERT INTO items
      (name, description, quantity, price, cost_price, category, image, created_at, updated_at, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      item
    );
  }

  console.log("✅ ITEMS SEEDED WITH REAL IMAGE URLs & subcategory_id = NULL");
};
