import 'package:flutter/material.dart';
import '../widgets/sport_illustrations.dart';
import 'venue_details_screen.dart';

class VenueBookingScreen extends StatefulWidget {
  final VoidCallback? onBack;

  const VenueBookingScreen({super.key, this.onBack});

  @override
  State<VenueBookingScreen> createState() => _VenueBookingScreenState();
}

class _VenueBookingScreenState extends State<VenueBookingScreen> {
  int _selectedSport = 0;

  final List<_VenueSportChip> _sports = const [
    _VenueSportChip('Football', Icons.sports_soccer),
    _VenueSportChip('Cricket', Icons.sports_cricket),
    _VenueSportChip('Tennis', Icons.sports_tennis),
  ];

  final List<_VenueItem> _venues = const [
    _VenueItem(
      venueType: VenueType.football,
      title: 'Model Town Sports Complex',
      location: '2.4 km away • Model Town',
      price: 20,
      rating: 4.8,
    ),
    _VenueItem(
      venueType: VenueType.basketball,
      title: 'Arena Pro Basketball',
      location: '3.8 km away • Downtown',
      price: 35,
      rating: 4.5,
    ),
    _VenueItem(
      venueType: VenueType.tennis,
      title: 'Grand Slam Tennis Club',
      location: '1.2 km away • Riverside',
      price: 25,
      rating: 4.9,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTopBar(),
            const SizedBox(height: 12),
            _buildSearch(),
            const SizedBox(height: 12),
            _buildSportsRow(),
            const SizedBox(height: 12),
            ..._venues.map(_buildVenueCard),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Row(
      children: [
        InkWell(
          onTap: widget.onBack,
          borderRadius: BorderRadius.circular(24),
          child: Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(
              color: Color(0xFF0D2A5B),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back, color: Color(0xFF2FA4FF)),
          ),
        ),
        const Expanded(
          child: Center(
            child: Text(
              'Book a Venue',
              style: TextStyle(
                color: Colors.white,
                fontSize: 30,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
        const SizedBox(width: 40),
      ],
    );
  }

  Widget _buildSearch() {
    return Container(
      height: 46,
      decoration: BoxDecoration(
        color: const Color(0xFF0E1C34),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF18345E)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: const Row(
        children: [
          Icon(Icons.search, color: Color(0xFF6C7EA3)),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Search venues, locations or sports...',
              style: TextStyle(color: Color(0xFF6C7EA3), fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSportsRow() {
    return Row(
      children: [
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_sports.length, (i) {
                final selected = i == _selectedSport;
                final sport = _sports[i];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => setState(() => _selectedSport = i),
                    borderRadius: BorderRadius.circular(24),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 9),
                      decoration: BoxDecoration(
                        color: selected
                            ? const Color(0xFF2A8CFF)
                            : const Color(0xFF14233F),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                            color: selected
                                ? const Color(0xFF2A8CFF)
                                : const Color(0xFF223A61)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            sport.icon,
                            size: 16,
                            color: selected
                                ? Colors.white
                                : const Color(0xFF8EA3C9),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            sport.label,
                            style: TextStyle(
                              color: selected
                                  ? Colors.white
                                  : const Color(0xFF8EA3C9),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
        const SizedBox(width: 6),
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: const Color(0xFF0D2A5B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF1F3F6F)),
          ),
          child: const Icon(Icons.tune, color: Color(0xFF2FA4FF), size: 20),
        ),
      ],
    );
  }

  Widget _buildVenueCard(_VenueItem v) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF131B2D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF22314A)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: VenueIllustration(type: v.venueType),
              ),
              Positioned(
                right: 10,
                top: 10,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xCC131B2D),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star,
                          size: 14, color: Color(0xFFFFC83D)),
                      const SizedBox(width: 4),
                      Text(
                        v.rating.toStringAsFixed(1),
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  v.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on,
                        size: 15, color: Color(0xFF6B7A95)),
                    const SizedBox(width: 4),
                    Text(
                      v.location,
                      style: const TextStyle(
                        color: Color(0xFF8FA0BF),
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'STARTING FROM',
                          style: TextStyle(
                            color: Color(0xFF6B7A95),
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.4,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text: '\$${v.price}',
                                style: const TextStyle(
                                  color: Color(0xFF2FA4FF),
                                  fontSize: 42,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const TextSpan(
                                text: '/hr',
                                style: TextStyle(
                                  color: Color(0xFF8FA0BF),
                                  fontSize: 24,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    SizedBox(
                      height: 46,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x552FA4FF),
                              blurRadius: 12,
                              offset: Offset(0, 5),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => VenueDetailsScreen(
                                  title: v.title,
                                  venueType: v.venueType,
                                  location: v.location,
                                  price: v.price,
                                ),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Book Now',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 17,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _VenueSportChip {
  final String label;
  final IconData icon;

  const _VenueSportChip(this.label, this.icon);
}

class _VenueItem {
  final VenueType venueType;
  final String title;
  final String location;
  final int price;
  final double rating;

  const _VenueItem({
    required this.venueType,
    required this.title,
    required this.location,
    required this.price,
    required this.rating,
  });
}
