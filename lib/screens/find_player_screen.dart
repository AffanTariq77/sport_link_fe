import 'package:flutter/material.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/primary_button.dart';
import '../widgets/map_view.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class FindPlayerScreen extends StatefulWidget {
  const FindPlayerScreen({super.key});

  @override
  State<FindPlayerScreen> createState() => _FindPlayerScreenState();
}

class _FindPlayerScreenState extends State<FindPlayerScreen> {
  final GlobalKey<MapViewState> mapKey = GlobalKey<MapViewState>();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    final mapHeight = (size.height * 0.38).clamp(220.0, 340.0);
    // example players with coords
    final players = [
      {'name': 'Marco Diaz', 'latlng': LatLng(37.7749, -122.4194), 'subtitle': '0.5 km away', 'tag': 'Intermediate'},
      {'name': 'Sofia Collins', 'latlng': LatLng(37.7755, -122.4180), 'subtitle': '1.2 km away', 'tag': 'Pro'},
      {'name': 'Liam Walker', 'latlng': LatLng(37.7765, -122.4170), 'subtitle': '2.0 km away', 'tag': 'Beginner'},
    ];

    final List<Marker> markers = players.map<Marker>((p) {
      final LatLng pos = p['latlng'] as LatLng;
      return Marker(
        width: 52,
        height: 52,
        point: pos,
        child: SizedBox(
          width: 52,
          height: 52,
          child: Material(
            color: Colors.transparent,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () async {
                // center map on marker and then open details
                mapKey.currentState?.moveTo(pos, zoom: 15);
                final navigator = Navigator.of(context);
                await Future.delayed(const Duration(milliseconds: 250));
                if (!mounted) return;
                navigator.pushNamed('/player_detail', arguments: {'name': p['name']});
              },
              child: Container(
                decoration: BoxDecoration(color: Theme.of(context).colorScheme.secondary, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 6)]),
                child: const Center(child: Icon(Icons.person, color: Colors.white, size: 20)),
              ),
            ),
          ),
        ),
      );
    }).toList();

    return AppScaffold(
      title: 'SportLink',
      body: Stack(
          children: [
            // interactive map
            Positioned.fill(
              child: Column(children: [
                SizedBox(
                  height: mapHeight,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: ClipRRect(borderRadius: BorderRadius.circular(16), child: MapView(key: mapKey, markers: markers, center: players.first['latlng'] as LatLng)),
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(child: Container()),
              ]),
            ),

            // bottom rounded sheet (constrain height by providing top so sheet has finite height)
            Positioned(
              left: 0,
              right: 0,
              top: mapHeight - 24,
              bottom: 0,
              child: DraggableScrollableSheet(
                initialChildSize: 0.42,
                minChildSize: 0.25,
                maxChildSize: 0.9,
                builder: (context, controller) => Container(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 12)],
                  ),
                  child: SingleChildScrollView(
                    controller: controller,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Text('Nearby Players', style: Theme.of(context).textTheme.titleLarge),
                          Text('${players.length} Found', style: TextStyle(color: theme.colorScheme.primary)),
                        ]),
                        const SizedBox(height: 8),
                        // search
                        TextField(decoration: InputDecoration(hintText: 'Search players or coaches', prefixIcon: const Icon(Icons.search, color: Colors.black26))),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 120,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            children: const [
                              SizedBox(width: 4),
                              _SportChip(label: 'Tennis', selected: true),
                              SizedBox(width: 8),
                              _SportChip(label: 'Padel'),
                              SizedBox(width: 8),
                              _SportChip(label: 'Badminton'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        // players list
                        Column(children: players.map((p) => _buildPlayerCard(context, p['name'] as String, p['subtitle'] as String, p['tag'] as String, p['latlng'] as LatLng)).toList())
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
    );
  }

  Widget _buildPlayerCard(BuildContext context, String name, String subtitle, String tag, LatLng? latLng) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () async {
            final navigator = Navigator.of(context);
            if (latLng != null) {
              mapKey.currentState?.moveTo(latLng, zoom: 15);
              await Future.delayed(const Duration(milliseconds: 220));
              if (!mounted) return;
              navigator.pushNamed('/player_detail', arguments: {'name': name});
            } else {
              navigator.pushNamed('/player_detail', arguments: {'name': name});
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.grey[200],
                child: ClipOval(
                  child: Image.asset(
                    'assets/images/${name.toLowerCase().replaceAll(' ', '_')}.png',
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.person, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(name, style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 6), Text('$subtitle • $tag', style: const TextStyle(color: Colors.black54))])),
              PrimaryButton(label: 'Invite', onPressed: () => Navigator.of(context).pushNamed('/player_detail', arguments: {'name': name})),
            ]),
          ),
        ),
      ),
    );
  }
}

class _SportChip extends StatelessWidget {
  final String label;
  final bool selected;
  const _SportChip({required this.label, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(color: selected ? const Color(0xFF0F8A66) : Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)),
      child: Text(label, style: TextStyle(color: selected ? Colors.white : Colors.black87, fontWeight: FontWeight.w700)),
    );
  }
}
