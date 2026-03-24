import 'package:flutter/material.dart';

class VenueSelectionScreen extends StatefulWidget {
  const VenueSelectionScreen({super.key});

  @override
  State<VenueSelectionScreen> createState() => _VenueSelectionScreenState();
}

class _VenueSelectionScreenState extends State<VenueSelectionScreen> {
  int _selected = 0;

  final venues = const [
    _VenueOption('Model Town Sports Complex', '1.2 km away • Lahore, PK', 20, 4.8),
    _VenueOption('Elite Arena Football Pitch', '2.8 km away • Lahore, PK', 26, 4.6),
    _VenueOption('Grand Slam Tennis Hub', '5.1 km away • Gulberg III', 35, 4.9),
    _VenueOption('Smash Hit Badminton', '8.0 km away • Near Market', 47, 4.7),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0F14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A1426),
        foregroundColor: Colors.white,
        title: const Text('Select Venue', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFF14233F),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                children: [
                  SizedBox(width: 10),
                  Icon(Icons.search, color: Color(0xFF7F8FAE)),
                  SizedBox(width: 8),
                  Text('Search for a court or pitch...',
                      style: TextStyle(color: Color(0xFF7F8FAE))),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: venues.length,
              itemBuilder: (context, index) {
                final v = venues[index];
                final selected = index == _selected;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: selected ? const Color(0xFF122648) : const Color(0xFF131B2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: selected ? const Color(0xFF2FA4FF) : const Color(0xFF22314A),
                    ),
                  ),
                  child: InkWell(
                    onTap: () => setState(() => _selected = index),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1B2B45),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.stadium, color: Color(0xFF84B4FF)),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(v.name,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 3),
                              Text(v.subtitle, style: const TextStyle(color: Color(0xFF7F8FAE), fontSize: 12)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('\$${v.price}/hr',
                                style: const TextStyle(color: Color(0xFF2FA4FF), fontWeight: FontWeight.w700)),
                            const SizedBox(height: 3),
                            Row(
                              children: [
                                const Icon(Icons.star, color: Color(0xFFFFC83D), size: 14),
                                const SizedBox(width: 3),
                                Text(v.rating.toStringAsFixed(1),
                                    style: const TextStyle(color: Color(0xFFFFC83D), fontSize: 12)),
                              ],
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: SizedBox(
              width: double.infinity,
              height: 46,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: const LinearGradient(colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)]),
                ),
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(venues[_selected].name),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Confirm Selection', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VenueOption {
  final String name;
  final String subtitle;
  final int price;
  final double rating;

  const _VenueOption(this.name, this.subtitle, this.price, this.rating);
}
