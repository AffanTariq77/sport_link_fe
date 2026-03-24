import 'package:flutter/material.dart';
import '../widgets/sport_illustrations.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // ─── Data ────────────────────────────────────────────────────────────────────

  final List<_MatchEntry> _matches = const [
    _MatchEntry(
      day: '24',
      month: 'OCT',
      title: 'Elite Padel Club',
      time: '18:00 - 19:30',
      sub: '4 Players Joined',
      subIcon: Icons.group_outlined,
      subColor: Color(0xFF9EA6B8),
      badge: 'UPCOMING',
      badgeColor: Color(0xFF2FA4FF),
    ),
    _MatchEntry(
      day: '21',
      month: 'OCT',
      title: 'Downtown Soccer Arena',
      time: '20:00 - 21:00',
      sub: 'Won 3-1',
      subIcon: Icons.emoji_events_outlined,
      subColor: Color(0xFF2ECC71),
      badge: 'COMPLETED',
      badgeColor: Color(0xFF2ECC71),
    ),
    _MatchEntry(
      day: '18',
      month: 'OCT',
      title: 'Meydan Tennis Courts',
      time: '08:00 - 09:30',
      sub: 'Payment Confirmed',
      subIcon: Icons.check_circle_outline,
      subColor: Color(0xFF9EA6B8),
      badge: 'HISTORY',
      badgeColor: Color(0xFF6B7384),
    ),
  ];

  final List<_MatchEntry> _bookings = const [
    _MatchEntry(
      day: '30',
      month: 'OCT',
      title: 'Model Town Futsal',
      time: '17:00 - 18:00',
      sub: 'Payment Confirmed',
      subIcon: Icons.check_circle_outline,
      subColor: Color(0xFF9EA6B8),
      badge: 'UPCOMING',
      badgeColor: Color(0xFF2FA4FF),
    ),
    _MatchEntry(
      day: '15',
      month: 'OCT',
      title: 'LCCA Cricket Ground',
      time: '09:00 - 11:00',
      sub: 'Refunded',
      subIcon: Icons.info_outline,
      subColor: Color(0xFFFF8C42),
      badge: 'CANCELLED',
      badgeColor: Color(0xFFFF4757),
    ),
  ];

  // ─── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0F14),
      body: SafeArea(
        child: NestedScrollView(
          headerSliverBuilder: (context, _) => [
            SliverToBoxAdapter(child: _buildHeader()),
          ],
          body: Column(
            children: [
              _buildTabBar(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildEntryList(_matches),
                    _buildEntryList(_bookings),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Header ──────────────────────────────────────────────────────────────────

  Widget _buildHeader() {
    return Container(
      color: const Color(0xFF0D0F14),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Top action row
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _iconBtn(Icons.settings_outlined, () {}),
                const Expanded(
                  child: Center(
                    child: Text(
                      'Profile',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18),
                    ),
                  ),
                ),
                _iconBtn(Icons.ios_share_outlined, () {}),
              ],
            ),
          ),

          // Avatar
          Stack(
            alignment: Alignment.center,
            children: [
              // Gradient ring
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const SweepGradient(
                    colors: [
                      Color(0xFF00D4FF),
                      Color(0xFF00FF55),
                      Color(0xFF00D4FF),
                    ],
                  ),
                ),
              ),
              // Inner photo
              Container(
                width: 102,
                height: 102,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF0D0F14),
                ),
                child: ClipOval(
                  child: const SportAvatar(seed: 0),
                ),
              ),
              // Online dot
              Positioned(
                bottom: 6,
                right: 6,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2ECC71),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF0D0F14), width: 2.5),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Name & location
          const Text(
            'Zaid K.',
            style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.location_on_outlined,
                  color: Color(0xFF4A9EFF), size: 16),
              SizedBox(width: 4),
              Text('Dubai, UAE',
                  style: TextStyle(color: Color(0xFF9EA6B8), fontSize: 14)),
            ],
          ),

          const SizedBox(height: 20),

          // Edit Profile button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                gradient: const LinearGradient(
                  colors: [Color(0xFF1665F5), Color(0xFF45A0FF)],
                ),
              ),
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {},
                icon: const Icon(Icons.edit_outlined,
                    color: Colors.white, size: 18),
                label: const Text(
                  'Edit Profile',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ),

          const SizedBox(height: 22),

          // Stats row
          Row(
            children: [
              _statCard('MATCHES', '48', '+12%'),
              const SizedBox(width: 10),
              _statCard('WIN RATE', '65%', '+2%'),
              const SizedBox(width: 10),
              _statCard('RATING', '4.8', '+0.1'),
            ],
          ),

          const SizedBox(height: 6),
        ],
      ),
    );
  }

  Widget _iconBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: const Color(0xFF1A1D24),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: Colors.white70, size: 20),
      ),
    );
  }

  Widget _statCard(String label, String value, String delta) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF13161E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF222533)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    color: Color(0xFF6B7384),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5)),
            const SizedBox(height: 6),
            Text(value,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(delta,
                style: const TextStyle(
                    color: Color(0xFF2ECC71),
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  // ─── Tab Bar ─────────────────────────────────────────────────────────────────

  Widget _buildTabBar() {
    return Container(
      color: const Color(0xFF0D0F14),
      child: TabBar(
        controller: _tabController,
        labelColor: Colors.white,
        unselectedLabelColor: const Color(0xFF6B7384),
        labelStyle:
            const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        unselectedLabelStyle:
            const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
        indicatorColor: const Color(0xFF2FA4FF),
        indicatorWeight: 3,
        indicatorSize: TabBarIndicatorSize.label,
        dividerColor: const Color(0xFF222533),
        tabs: const [
          Tab(text: 'My Matches'),
          Tab(text: 'Booking History'),
        ],
      ),
    );
  }

  // ─── Entry List ──────────────────────────────────────────────────────────────

  Widget _buildEntryList(List<_MatchEntry> entries) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      itemCount: entries.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _entryCard(entries[i]),
    );
  }

  Widget _entryCard(_MatchEntry e) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF13161E),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF222533)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Date box
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: const Color(0xFF1A1D24),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  e.day,
                  style: const TextStyle(
                      color: Color(0xFF2FA4FF),
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      height: 1.1),
                ),
                Text(
                  e.month,
                  style: const TextStyle(
                      color: Color(0xFF6B7384),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5),
                ),
              ],
            ),
          ),

          const SizedBox(width: 14),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        e.title,
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: e.badgeColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                            color: e.badgeColor.withValues(alpha: 0.4),
                            width: 1),
                      ),
                      child: Text(
                        e.badge,
                        style: TextStyle(
                            color: e.badgeColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.4),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 7),
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded,
                        color: Color(0xFF6B7384), size: 14),
                    const SizedBox(width: 5),
                    Text(e.time,
                        style: const TextStyle(
                            color: Color(0xFF9EA6B8), fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 5),
                Row(
                  children: [
                    Icon(e.subIcon, color: e.subColor, size: 14),
                    const SizedBox(width: 5),
                    Text(e.sub,
                        style:
                            TextStyle(color: e.subColor, fontSize: 13)),
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

// ─── Data model ───────────────────────────────────────────────────────────────

class _MatchEntry {
  final String day;
  final String month;
  final String title;
  final String time;
  final String sub;
  final IconData subIcon;
  final Color subColor;
  final String badge;
  final Color badgeColor;

  const _MatchEntry({
    required this.day,
    required this.month,
    required this.title,
    required this.time,
    required this.sub,
    required this.subIcon,
    required this.subColor,
    required this.badge,
    required this.badgeColor,
  });
}
