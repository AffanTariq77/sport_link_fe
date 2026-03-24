import 'package:flutter/material.dart';
import '../widgets/sport_illustrations.dart';
import 'create_match_screen.dart';
import 'notification_screen.dart';
import 'profile_screen.dart';
import 'tournament_screen.dart';
import 'venue_booking_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedNavIndex = 0;
  int _selectedSport = 0;

  final List<String> _sports = ['All', 'Cricket', 'Football', 'Tennis'];
  final List<IconData?> _sportIcons = [
    null,
    Icons.sports_cricket,
    Icons.sports_soccer,
    Icons.sports_tennis,
  ];

  Widget _buildHomeBody() {
    return SafeArea(
      child: Column(
        children: [
          _buildTopBar(),
          const Divider(color: Color(0xFF1E2230), height: 1),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  _buildActionCards(),
                  const SizedBox(height: 22),
                  _buildSportFilters(),
                  const SizedBox(height: 26),
                  _buildMatchesSection(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0F14),
      body: IndexedStack(
        index: _selectedNavIndex,
        children: [
          _buildHomeBody(),
          VenueBookingScreen(
            onBack: () => setState(() => _selectedNavIndex = 0),
          ),
          const CreateMatchScreen(),
          const TournamentScreen(),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ─── Top Bar ────────────────────────────────────────────────────────────────

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Avatar with online dot
          Stack(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: const Color(0xFF2A3A5E),
                child: ClipOval(
                  child: const SizedBox(
                    width: 44,
                    height: 44,
                    child: SportAvatar(seed: 0),
                  ),
                ),
              ),
              Positioned(
                right: 1,
                bottom: 1,
                child: Container(
                  width: 11,
                  height: 11,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00FF55),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF0D0F14), width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          // Location (centred)
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.location_on, color: Color(0xFF4A9EFF), size: 18),
                SizedBox(width: 4),
                Text(
                  'Lahore, Punjab',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                SizedBox(width: 4),
                Icon(Icons.keyboard_arrow_down, color: Colors.white60, size: 20),
              ],
            ),
          ),
          // Notification bell
          SizedBox(
            width: 44,
            height: 44,
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const NotificationScreen()),
                );
              },
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: Color(0xFF1A1D24),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.notifications_outlined,
                        color: Colors.white, size: 22),
                  ),
                  Positioned(
                    top: 9,
                    right: 9,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF4757),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Action Cards ───────────────────────────────────────────────────────────

  Widget _buildActionCards() {
    return Row(
      children: [
        Expanded(
          child: _actionCard(
            label: 'Book a Venue',
            onTap: () => setState(() => _selectedNavIndex = 1),
            gradient: const LinearGradient(
              colors: [Color(0xFF1553C0), Color(0xFF3A84FF)],
              begin: Alignment.bottomLeft,
              end: Alignment.topRight,
            ),
            icon: Icons.book_online_outlined,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _actionCard(
            label: 'Find a Match',
            onTap: () => setState(() => _selectedNavIndex = 2),
            gradient: const LinearGradient(
              colors: [Color(0xFF0F6E30), Color(0xFF27B360)],
              begin: Alignment.bottomLeft,
              end: Alignment.topRight,
            ),
            icon: Icons.search_rounded,
          ),
        ),
      ],
    );
  }

  Widget _actionCard({
    required String label,
    required VoidCallback onTap,
    required Gradient gradient,
    required IconData icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 130,
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Stack(
          children: [
            // Decorative large faded icon in the background top-right
            Positioned(
              top: -10,
              right: -10,
              child: Icon(icon, size: 90, color: Colors.white.withValues(alpha: 0.1)),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: Colors.white, size: 22),
                  ),
                  const Spacer(),
                  Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Sport Filter Chips ─────────────────────────────────────────────────────

  Widget _buildSportFilters() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(_sports.length, (i) {
          final selected = _selectedSport == i;
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: GestureDetector(
              onTap: () => setState(() => _selectedSport = i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? const Color(0xFF2FA4FF) : const Color(0xFF1A1D24),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(
                    color: selected ? const Color(0xFF2FA4FF) : const Color(0xFF2A2D38),
                  ),
                ),
                child: Row(
                  children: [
                    if (_sportIcons[i] != null) ...[
                      Icon(
                        _sportIcons[i],
                        size: 15,
                        color: selected ? Colors.white : Colors.white54,
                      ),
                      const SizedBox(width: 6),
                    ],
                    Text(
                      _sports[i],
                      style: TextStyle(
                        color: selected ? Colors.white : Colors.white54,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
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

  // ─── Matches Near You ───────────────────────────────────────────────────────

  Widget _buildMatchesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Matches Near You',
              style: TextStyle(
                  color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            GestureDetector(
              onTap: () {},
              child: const Text(
                'See all',
                style: TextStyle(
                    color: Color(0xFF2FA4FF),
                    fontSize: 14,
                    fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _matchCard(
          sport: 'football',
          title: 'Football Friendly',
          host: 'Zaid K.',
          level: 'INTERMEDIATE',
          levelColor: const Color(0xFF2FA4FF),
          time: 'Today, 18:30',
          venue: 'Model Town Field',
          avatarCount: 5,
          needed: 'Need 2 more players',
        ),
        const SizedBox(height: 12),
        _matchCard(
          sport: 'cricket',
          title: 'Evening T20 Practice',
          host: 'Ahmed S.',
          level: 'ADVANCED',
          levelColor: const Color(0xFFFF8C42),
          time: 'Tomorrow, 16:00',
          venue: 'LCCA Ground',
          avatarCount: 8,
          needed: 'Need 4 more players',
        ),
        const SizedBox(height: 12),
        _matchCard(
          sport: 'tennis',
          title: 'Singles Drill',
          host: 'Sara M.',
          level: 'INTERMEDIATE',
          levelColor: const Color(0xFF2ECC71),
          time: 'Mon, 07:00',
          venue: 'Defence Club Courts',
          avatarCount: 7,
          needed: 'Need 1 more player',
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _matchCard({
    required String sport,
    required String title,
    required String host,
    required String level,
    required Color levelColor,
    required String time,
    required String venue,
    required int avatarCount,
    required String needed,
  }) {
    final sportIcon = sport == 'football'
        ? Icons.sports_soccer
        : sport == 'cricket'
            ? Icons.sports_cricket
            : Icons.sports_tennis;

    final sportBg = sport == 'football'
        ? const Color(0xFF0E2247)
        : sport == 'cricket'
            ? const Color(0xFF2D1508)
            : const Color(0xFF063A18);

    final sportIconColor = sport == 'football'
        ? const Color(0xFF4A9EFF)
        : sport == 'cricket'
            ? const Color(0xFFFF8C42)
            : const Color(0xFF2ECC71);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF13161E),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF222533), width: 1),
      ),
      child: Column(
        children: [
          // Row 1: Sport icon + title/host + Join button
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration:
                    BoxDecoration(color: sportBg, borderRadius: BorderRadius.circular(14)),
                child: Icon(sportIcon, color: sportIconColor, size: 26),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15),
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Text(
                          'Host: $host',
                          style: const TextStyle(
                              color: Color(0xFF8A92A8), fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: levelColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            level,
                            style: TextStyle(
                                color: levelColor,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.4),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2FA4FF),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  elevation: 0,
                ),
                child: const Text(
                  'Join',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 14),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Row 2: Time + Venue
          Row(
            children: [
              const Icon(Icons.access_time_rounded,
                  color: Color(0xFF6B7384), size: 15),
              const SizedBox(width: 5),
              Text(time,
                  style: const TextStyle(
                      color: Color(0xFF9EA6B8), fontSize: 13)),
              const SizedBox(width: 18),
              const Icon(Icons.location_on_outlined,
                  color: Color(0xFF6B7384), size: 15),
              const SizedBox(width: 5),
              Expanded(
                child: Text(venue,
                    style: const TextStyle(
                        color: Color(0xFF9EA6B8), fontSize: 13),
                    overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Row 3: Avatars + needed text
          Row(
            children: [
              _avatarStack(avatarCount),
              const Spacer(),
              const Icon(Icons.group_add_outlined,
                  color: Color(0xFF2FA4FF), size: 16),
              const SizedBox(width: 5),
              Text(
                needed,
                style: const TextStyle(
                    color: Color(0xFF2FA4FF),
                    fontSize: 13,
                    fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _avatarStack(int count) {
    const avatarSeeds = [1, 2, 3];
    final showCount = count > 3;

    return SizedBox(
      width: showCount ? 84 : 56,
      height: 26,
      child: Stack(
        children: [
          for (int i = 0; i < 2; i++)
            Positioned(
              left: i * 18.0,
              child: CircleAvatar(
                radius: 13,
                backgroundColor: const Color(0xFF2A3A5E),
                child: ClipOval(
                  child: SizedBox(
                    width: 26,
                    height: 26,
                    child: SportAvatar(seed: avatarSeeds[i]),
                  ),
                ),
              ),
            ),
          if (showCount)
            Positioned(
              left: 36,
              child: CircleAvatar(
                radius: 13,
                backgroundColor: const Color(0xFF2A3A5E),
                child: Text(
                  '+$count',
                  style: const TextStyle(
                      fontSize: 9,
                      color: Colors.white,
                      fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ─── Bottom Nav ─────────────────────────────────────────────────────────────

  Widget _buildBottomNav() {
    const items = [
      {'icon': Icons.home_rounded, 'label': 'Home'},
      {'icon': Icons.map_outlined, 'label': 'Venues'},
      {'icon': Icons.sports_score_rounded, 'label': 'Matches'},
      {'icon': Icons.emoji_events_outlined, 'label': 'Tournaments'},
      {'icon': Icons.person_outline_rounded, 'label': 'Profile'},
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF13161E),
        border: Border(top: BorderSide(color: Color(0xFF222533), width: 1)),
      ),
      child: BottomNavigationBar(
        currentIndex: _selectedNavIndex,
        onTap: (i) => setState(() => _selectedNavIndex = i),
        backgroundColor: Colors.transparent,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF2FA4FF),
        unselectedItemColor: const Color(0xFF6B7384),
        selectedLabelStyle:
            const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: items
            .map(
              (item) => BottomNavigationBarItem(
                icon: Icon(item['icon'] as IconData),
                label: item['label'] as String,
              ),
            )
            .toList(),
      ),
    );
  }
}
