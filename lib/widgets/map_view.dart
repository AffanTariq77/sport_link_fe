import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class MapView extends StatefulWidget {
  final List<Marker> markers;
  final LatLng center;

  const MapView({super.key, required this.markers, required this.center});

  @override
  MapViewState createState() => MapViewState();
}

/// Public state so parent widgets can control the map (e.g. moveTo())
class MapViewState extends State<MapView> {
  late final MapController mapController;

  @override
  void initState() {
    super.initState();
    mapController = MapController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Ensure map recenters to provided center after first build (API differences across flutter_map versions)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        mapController.move(widget.center, 13);
      } catch (_) {}
    });
  }

  /// Move the map view to [loc] with optional [zoom]. Safe to call when mounted.
  void moveTo(LatLng loc, {double zoom = 15}) {
    if (!mounted) return;
    try {
      mapController.move(loc, zoom);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: mapController,
      options: MapOptions(),
      children: [
        TileLayer(
          urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: const ['a', 'b', 'c'],
        ),
        MarkerLayer(markers: widget.markers),
      ],
    );
  }
}
