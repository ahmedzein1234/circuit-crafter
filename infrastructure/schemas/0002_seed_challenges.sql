-- Seed data: Tutorial challenges for Circuit Crafter

-- Create a system user for built-in challenges
INSERT OR IGNORE INTO users (id, email, username, password_hash, reputation_score, subscription_tier)
VALUES ('system', 'system@circuit-crafter.com', 'CircuitCrafter', 'system-no-login', 10000, 'premium');

-- Tutorial Challenge 1: Your First Circuit
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-1',
  'system',
  'Your First Circuit',
  'Learn the basics by connecting a battery to an LED with a resistor. This simple circuit will teach you how current flows from positive to negative.',
  'beginner',
  '{"maxComponents": 5, "allowedComponentTypes": ["battery", "resistor", "led", "ground"]}',
  '{"type": "power_led"}',
  '["Start with a battery - it''s your power source", "LEDs need a resistor to limit current", "Connect positive to negative to complete the circuit"]',
  180
);

-- Tutorial Challenge 2: Protect Your LED
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-2',
  'system',
  'Protect Your LED',
  'An LED without proper protection will burn out! Calculate the right resistor value to keep your LED safe. Target: 20mA through a red LED (2V forward voltage) with a 9V battery.',
  'beginner',
  '{"maxComponents": 4, "allowedComponentTypes": ["battery", "resistor", "led", "ground"]}',
  '{"type": "power_led", "tolerancePercent": 10}',
  '["Use Ohm''s Law: V = I × R", "The resistor drops the excess voltage", "R = (9V - 2V) / 0.02A = 350Ω"]',
  240
);

-- Tutorial Challenge 3: The Switch
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-3',
  'system',
  'The Switch',
  'Add control to your circuit! Build a circuit where a switch can turn an LED on and off.',
  'beginner',
  '{"maxComponents": 5, "allowedComponentTypes": ["battery", "resistor", "led", "switch", "ground"]}',
  '{"type": "power_led"}',
  '["Place the switch in series with the LED", "Double-click the switch to toggle it", "The circuit should light up when the switch is closed"]',
  180
);

-- Tutorial Challenge 4: Parallel LEDs
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-4',
  'system',
  'Parallel Paths',
  'Light up two LEDs using a single battery. Learn about parallel circuits and how current divides.',
  'intermediate',
  '{"maxComponents": 8, "allowedComponentTypes": ["battery", "resistor", "led", "ground"]}',
  '{"type": "power_led", "targetComponents": ["led1", "led2"]}',
  '["Each LED needs its own resistor", "In parallel, voltage is the same across each branch", "Current splits between the branches"]',
  300
);

-- Tutorial Challenge 5: Logic AND Gate
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-5',
  'system',
  'AND Gate Logic',
  'Introduction to digital logic! Build a circuit where the LED only lights when BOTH switches are closed.',
  'intermediate',
  '{"maxComponents": 8, "allowedComponentTypes": ["battery", "resistor", "led", "switch", "and_gate", "ground"]}',
  '{"type": "logic_output", "expectedOutputs": {"and_gate": true}}',
  '["An AND gate outputs HIGH only when ALL inputs are HIGH", "Connect two switches to the AND gate inputs", "The output controls the LED"]',
  300
);

-- Tutorial Challenge 6: Logic OR Gate
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-6',
  'system',
  'OR Gate Logic',
  'Build a circuit where the LED lights when EITHER switch is closed (or both).',
  'intermediate',
  '{"maxComponents": 8, "allowedComponentTypes": ["battery", "resistor", "led", "switch", "or_gate", "ground"]}',
  '{"type": "logic_output", "expectedOutputs": {"or_gate": true}}',
  '["An OR gate outputs HIGH when ANY input is HIGH", "Think of it as an alternative path for current", "The OR gate enables multiple triggering options"]',
  300
);

-- Tutorial Challenge 7: NOT Gate (Inverter)
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-7',
  'system',
  'The Inverter',
  'Create a circuit where the LED is ON when the switch is OFF, and OFF when the switch is ON.',
  'intermediate',
  '{"maxComponents": 6, "allowedComponentTypes": ["battery", "resistor", "led", "switch", "not_gate", "ground"]}',
  '{"type": "logic_output", "expectedOutputs": {"not_gate": true}}',
  '["A NOT gate inverts its input", "HIGH becomes LOW, LOW becomes HIGH", "This is the foundation of many digital circuits"]',
  300
);

-- Tutorial Challenge 8: Series Resistors
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'tutorial-8',
  'system',
  'Series Resistance',
  'Use two resistors in series to achieve the target resistance. Calculate how resistances add up!',
  'intermediate',
  '{"maxComponents": 5, "allowedComponentTypes": ["battery", "resistor", "led", "ground"]}',
  '{"type": "voltage_match", "expectedOutputs": {"led": 2}, "tolerancePercent": 10}',
  '["Resistors in series add up: R_total = R1 + R2", "The voltage drops across each resistor", "More resistance = less current"]',
  300
);

-- Advanced Challenge 1: Two-Way Switch
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'advanced-1',
  'system',
  'Stairway Switches',
  'Build the classic two-way switch circuit used in staircases. The light should toggle from either switch location.',
  'advanced',
  '{"maxComponents": 10}',
  '{"type": "power_led"}',
  '["This requires creative wiring", "Think about XOR logic", "Each switch changes the state regardless of the other"]',
  600
);

-- Expert Challenge: 4-Bit Adder
INSERT OR IGNORE INTO challenges (id, creator_id, title, description, difficulty, constraints_json, target_json, hints_json, time_limit_seconds)
VALUES (
  'expert-1',
  'system',
  'Binary Adder',
  'Build a circuit that adds two 1-bit numbers and shows the result. This is the foundation of all computer arithmetic!',
  'expert',
  '{"maxComponents": 20}',
  '{"type": "custom"}',
  '["You need a half-adder circuit", "Sum = A XOR B, Carry = A AND B", "XOR can be built from AND, OR, and NOT gates"]',
  1200
);

-- Mark some challenges as featured
UPDATE challenges SET featured = 1 WHERE id IN ('tutorial-1', 'tutorial-2', 'tutorial-5', 'advanced-1');
