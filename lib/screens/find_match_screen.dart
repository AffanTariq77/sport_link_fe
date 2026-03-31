import 'package:flutter/material.dart';
import '../widgets/common_header.dart';

class FindMatchScreen extends StatefulWidget {
  const FindMatchScreen({super.key});

  @override
  State<FindMatchScreen> createState() => _FindMatchScreenState();
}

class _FindMatchScreenState extends State<FindMatchScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: const CommonHeader(title: 'Find Player'),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // search + chips
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,4))]),
                    child: const TextField(
                      decoration: InputDecoration(hintText: 'Search for matches', border: InputBorder.none, prefixIcon: Icon(Icons.search, color: Colors.black26)),
                    ),
                  ),

                  const SizedBox(height: 12),
                  SizedBox(
                    height: 44,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        const SizedBox(width: 4),
                        _filter('All Sports', selected: true),
                        const SizedBox(width: 8),
                        _filter('Time'),
                        const SizedBox(width: 8),
                        _filter('Distance'),
                        const SizedBox(width: 8),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),
                  // map
                  Container(
                    height: 200,
                    decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
                    child: const Center(child: Icon(Icons.map, size: 72, color: Colors.white70)),
                  ),

                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Nearby Matches', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                      Text('12 found', style: TextStyle(color: theme.colorScheme.primary)),
                    ],
                  ),

                  const SizedBox(height: 12),
                  Column(
                    children: [
                      _matchCard('Tuesday Night Lights', '19:00 - 20:30 • Olympic Park', '8/10 Joined', 'Oct 24'),
                      const SizedBox(height: 12),
                      _matchCard('Mixed Friendly Set', '10:00 - 11:30 • West Court 3', '3/4 Joined', 'Oct 25'),
                      const SizedBox(height: 80),
                    ],
                  ),
                ],
              ),
            ),

            // create FAB bottom-right
            Positioned(
              right: 18,
              bottom: 18,
              child: FloatingActionButton.extended(
                onPressed: () => Navigator.of(context).pushNamed('/create_match'),
                backgroundColor: const Color(0xFF0F8A66),
                icon: const Icon(Icons.add),
                label: const Text('Create Match'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _filter(String label, {bool selected = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(color: selected ? const Color(0xFF0F8A66) : Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)),
      child: Text(label, style: TextStyle(color: selected ? Colors.white : Colors.black87, fontWeight: FontWeight.w700)),
    );
  }

  Widget _matchCard(String title, String meta, String progressText, String date) {
    final progress = _parseProgress(progressText);
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0,6))]),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(8)), child: const Text('5-A-SIDE', style: TextStyle(fontSize: 11, color: Colors.green))),
                          const SizedBox(width: 8),
                          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(8)), child: const Text('ADVANCED', style: TextStyle(fontSize: 11, color: Colors.blue))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Text(meta, style: const TextStyle(color: Colors.black54)),
                      const SizedBox(height: 10),
                      LinearProgressIndicator(value: progress, backgroundColor: Colors.grey[200], color: const Color(0xFFEA5B2C), minHeight: 8),
                      const SizedBox(height: 6),
                      Text(progressText, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                  child: Text(date, style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pushNamed('/booking_summary', arguments: {'title': title, 'subtitle': meta}),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA5B2C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
                child: const Text('Join Match', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  double _parseProgress(String text) {
    // text like '8/10 Joined' — parse 8/10
    try {
      final parts = text.split(' ')[0].split('/');
      final a = double.parse(parts[0]);
      final b = double.parse(parts[1]);
      return (a / b).clamp(0.0, 1.0);
    } catch (_) {
      return 0.0;
    }
  }
}
