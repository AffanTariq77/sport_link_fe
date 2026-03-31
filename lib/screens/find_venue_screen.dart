import 'package:flutter/material.dart';

class FindVenueScreen extends StatefulWidget {
  const FindVenueScreen({super.key});

  @override
  State<FindVenueScreen> createState() => _FindVenueScreenState();
}

class _FindVenueScreenState extends State<FindVenueScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back, color: Color(0xFF0F8A66)),
                  ),
                  const SizedBox(width: 4),
                  const Text('Find Venue', style: TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w700, fontSize: 18)),
                  const Spacer(),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.search, color: Colors.black54)),
                ],
              ),

              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,4))]),
                child: const TextField(
                  decoration: InputDecoration(
                    hintText: 'Search for nearby courts or clubs...',
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.explore, color: Colors.black26),
                  ),
                ),
              ),

              const SizedBox(height: 12),
              Row(
                children: [
                  _filterChip('Sport Type', selected: true),
                  const SizedBox(width: 8),
                  _filterChip('Distance'),
                  const SizedBox(width: 8),
                  _filterChip('Price'),
                ],
              ),

              const SizedBox(height: 16),
              // map placeholder
              Container(
                height: 200,
                decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
                child: Stack(
                  children: [
                    Positioned.fill(child: Center(child: Icon(Icons.map, size: 72, color: Colors.white70))),
                    Positioned(
                      left: 24,
                      top: 60,
                      child: _mapMarkerBadge('Center Court'),
                    ),
                    Positioned(
                      right: 24,
                      bottom: 24,
                      child: FloatingActionButton.small(onPressed: () {}, child: const Icon(Icons.my_location)),
                    )
                  ],
                ),
              ),

              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recommended for You', style: TextStyle(fontWeight: FontWeight.w700)),
                  Text('View Map Fullscreen', style: TextStyle(color: theme.colorScheme.primary)),
                ],
              ),

              const SizedBox(height: 12),
              Column(
                children: [
                  _venueCard('Elite Tennis Plaza', 'South Kensington, London • 1.2 mi', rating: '4.9'),
                  const SizedBox(height: 12),
                  _venueCard('Sky Hoops Arena', 'Shoreditch, London • 2.8 mi', rating: '4.7'),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _filterChip(String label, {bool selected = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: selected ? const Color(0xFF0F8A66) : Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.black12)),
      child: Text(label, style: TextStyle(color: selected ? Colors.white : Colors.black87, fontWeight: FontWeight.w700)),
    );
  }

  Widget _mapMarkerBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6)]),
      child: Row(children: [const Icon(Icons.search, color: Color(0xFF0F8A66)), const SizedBox(width: 8), Text(label, style: const TextStyle(fontWeight: FontWeight.w700))]),
    );
  }

  Widget _venueCard(String title, String subtitle, {String? rating}) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0,6))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Container(height: 160, color: Colors.blueGrey.shade200, child: const Center(child: Icon(Icons.photo, size: 56, color: Colors.white70))),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800))),
                    if (rating != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6, offset: const Offset(0,4))]),
                        child: Row(children: [Text(rating, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(width: 6), const Icon(Icons.star, color: Colors.amber, size: 16)]),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(subtitle, style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 12),
                const Text("TODAY'S SLOTS", style: TextStyle(color: Colors.black54, fontSize: 12)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _slotChip('09:00 AM', 'Open'),
                    const SizedBox(width: 8),
                    _slotChip('10:00 AM', 'Booked'),
                    const SizedBox(width: 8),
                    _slotChip('11:00 AM', 'Open'),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pushNamed('/booking_summary', arguments: {'title': title, 'subtitle': subtitle}),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA5B2C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
                    child: const Text('Book Slot', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _slotChip(String time, String label) {
    final booked = label.toLowerCase() == 'booked';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: booked ? Colors.grey[200] : Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: booked ? Colors.black12 : Colors.black12)),
      child: Column(
        children: [
          Text(time, style: TextStyle(color: booked ? Colors.black38 : Colors.black54, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(color: booked ? Colors.black38 : Colors.green[700], fontSize: 12)),
        ],
      ),
    );
  }
}
