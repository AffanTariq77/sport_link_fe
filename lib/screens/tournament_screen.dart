import 'package:flutter/material.dart';
import '../widgets/sport_illustrations.dart';

class TournamentScreen extends StatefulWidget {
  const TournamentScreen({super.key});

  @override
  State<TournamentScreen> createState() => _TournamentScreenState();
}

class _TournamentScreenState extends State<TournamentScreen> {
  int _selectedCategory = 0;

  final List<_CategoryChipData> _categories = const [
    _CategoryChipData('Football', Icons.sports_soccer),
    _CategoryChipData('Cricket', Icons.sports_cricket),
    _CategoryChipData('Tennis', Icons.sports_tennis),
  ];

  final List<_TournamentCardData> _upcoming = const [
    _TournamentCardData(
      venueType: VenueType.cricket,
      title: 'Elite Cricket Super League',
      location: 'Mumbai Sports Arena',
      tag: 'CRICKET',
      leftLabel: 'ENTRY FEE',
      leftValue: r'$50 / Team',
      slotsJoined: 12,
      slotsTotal: 16,
      topBadge: 'LIMITED SLOTS',
    ),
    _TournamentCardData(
      venueType: VenueType.tennis,
      title: 'National Tennis Open',
      location: 'Green Valley Club',
      tag: 'TENNIS',
      leftLabel: 'PRIZEPOOL',
      leftValue: r'$500',
      slotsJoined: 4,
      slotsTotal: 32,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 10),
            _buildTabs(),
            const SizedBox(height: 14),
            _buildFeaturedCard(),
            const SizedBox(height: 18),
            const Text(
              'SPORTS CATEGORIES',
              style: TextStyle(
                color: Color(0xFF6F7A91),
                fontWeight: FontWeight.w700,
                letterSpacing: 1.3,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 12),
            _buildCategoryChips(),
            const SizedBox(height: 18),
            _buildUpcomingHeader(),
            const SizedBox(height: 12),
            ..._upcoming.map(_buildTournamentCard),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: const Color(0xFF0A1426),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1D2A40)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          const Icon(Icons.emoji_events_outlined,
              color: Color(0xFF00E4FF), size: 20),
          const SizedBox(width: 10),
          const Text(
            'Tournaments',
            style: TextStyle(
              color: Colors.white,
              fontSize: 29,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search, color: Colors.white70),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.tune, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      padding: const EdgeInsets.only(bottom: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF1D2A40))),
      ),
      child: const Row(
        children: [
          _TopTab(text: 'Explore', selected: true),
          SizedBox(width: 20),
          _TopTab(text: 'My Tournaments', selected: false),
        ],
      ),
    );
  }

  Widget _buildFeaturedCard() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF25314B)),
        gradient: const LinearGradient(
          colors: [Color(0xFF173A31), Color(0xFF0E233B)],
        ),
      ),
      child: Stack(
        children: [
          // Football field illustration (right side, clipped)
          Positioned(
            right: 0,
            top: 0,
            bottom: 0,
            width: 150,
            child: Opacity(
              opacity: 0.28,
              child: const VenueIllustration(type: VenueType.football),
            ),
          ),
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 180,
              height: 180,
              decoration: const BoxDecoration(
                color: Color(0x332ECC71),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFABF100),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'FEATURED',
                    style: TextStyle(
                      color: Color(0xFF0A1426),
                      fontWeight: FontWeight.w800,
                      fontSize: 11,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Punjab Football\nChampionship',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    height: 1.1,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '\$1000+ Pool  •  Oct 25, 2023',
                  style: TextStyle(
                    color: Color(0xFF9AA8C0),
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'TOURNAMENT',
                  style: TextStyle(
                    color: Color(0xFF6F7A91),
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Register Now',
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
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(_categories.length, (index) {
          final selected = index == _selectedCategory;
          final chip = _categories[index];
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: InkWell(
              onTap: () => setState(() => _selectedCategory = index),
              borderRadius: BorderRadius.circular(24),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 170),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: selected
                      ? const Color(0xFF2A8CFF)
                      : const Color(0xFF172136),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: selected
                        ? const Color(0xFF2A8CFF)
                        : const Color(0xFF263650),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      chip.icon,
                      size: 16,
                      color: selected ? Colors.white : const Color(0xFFA2B0C8),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      chip.text,
                      style: TextStyle(
                        color:
                            selected ? Colors.white : const Color(0xFFA2B0C8),
                        fontWeight: FontWeight.w600,
                        fontSize: 24,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildUpcomingHeader() {
    return Row(
      children: [
        const Text(
          'Upcoming Tournaments',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 33,
          ),
        ),
        const Spacer(),
        InkWell(
          onTap: () {},
          child: const Text(
            'View All',
            style: TextStyle(
              color: Color(0xFF00E4FF),
              fontWeight: FontWeight.w700,
              fontSize: 18,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTournamentCard(_TournamentCardData data) {
    final ratio = data.slotsTotal == 0 ? 0.0 : data.slotsJoined / data.slotsTotal;

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
                aspectRatio: 16 / 7.5,
                child: VenueIllustration(type: data.venueType),
              ),
              if (data.topBadge != null)
                Positioned(
                  left: 10,
                  top: 10,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF112119),
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(color: const Color(0xFF315B43)),
                    ),
                    child: Text(
                      data.topBadge!,
                      style: const TextStyle(
                        color: Color(0xFF8CFF4F),
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                      ),
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
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        data.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A263C),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF2A3C59)),
                      ),
                      child: Text(
                        data.tag,
                        style: const TextStyle(
                          color: Color(0xFF8EA0BF),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on,
                        color: Color(0xFF6B7A95), size: 15),
                    const SizedBox(width: 4),
                    Text(
                      data.location,
                      style: const TextStyle(
                        color: Color(0xFF8FA0BF),
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            data.leftLabel,
                            style: const TextStyle(
                              color: Color(0xFF6B7A95),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            data.leftValue,
                            style: const TextStyle(
                              color: Color(0xFFA2FF38),
                              fontWeight: FontWeight.w800,
                              fontSize: 30,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'SLOTS LEFT',
                            style: TextStyle(
                              color: Color(0xFF6B7A95),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${data.slotsJoined}/${data.slotsTotal} joined',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 29,
                            ),
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: LinearProgressIndicator(
                              value: ratio,
                              minHeight: 6,
                              backgroundColor: const Color(0xFF25334B),
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                  Color(0xFF00E4FF)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 40,
                        child: OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF304058)),
                            backgroundColor: const Color(0xFF1A2438),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text(
                            'Details',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: SizedBox(
                        height: 40,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)],
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'Join Now',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
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

class _TopTab extends StatelessWidget {
  final String text;
  final bool selected;

  const _TopTab({required this.text, required this.selected});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          text,
          style: TextStyle(
            color: selected ? Colors.white : const Color(0xFF7A879E),
            fontWeight: FontWeight.w700,
            fontSize: 22,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: text == 'Explore' ? 58 : 0,
          height: 3,
          color: selected ? const Color(0xFF2FA4FF) : Colors.transparent,
        ),
      ],
    );
  }
}

class _CategoryChipData {
  final String text;
  final IconData icon;

  const _CategoryChipData(this.text, this.icon);
}

class _TournamentCardData {
  final VenueType venueType;
  final String title;
  final String location;
  final String tag;
  final String leftLabel;
  final String leftValue;
  final int slotsJoined;
  final int slotsTotal;
  final String? topBadge;

  const _TournamentCardData({
    required this.venueType,
    required this.title,
    required this.location,
    required this.tag,
    required this.leftLabel,
    required this.leftValue,
    required this.slotsJoined,
    required this.slotsTotal,
    this.topBadge,
  });
}
