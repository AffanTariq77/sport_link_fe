import 'package:flutter/material.dart';
import '../utils/responsive.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/animated_card.dart';
import 'find_player_screen.dart';
import 'tournament_list_screen.dart';
import 'messages_list_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _onNavTap(int idx) {
    setState(() => _selectedIndex = idx);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final pages = <Widget>[
      // Home page (existing layout) using AppScaffold for consistent header
      AppScaffold(
        title: 'SportLink',
        body: SingleChildScrollView(
          padding: context.pagePadding().copyWith(bottom: 96.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 6),
              RichText(
                text: const TextSpan(
                  children: [
                    TextSpan(text: 'Welcome to\n', style: TextStyle(color: Colors.black87, fontSize: 20)),
                    TextSpan(text: 'SportLink', style: TextStyle(color: Color(0xFF0F8A66), fontSize: 28, fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
              const SizedBox(height: 6),
              const Text('Find your next match in the oasis of sport.', style: TextStyle(color: Colors.black54)),

              const SizedBox(height: 12),
              // search field
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,4))]),
                child: const TextField(
                  decoration: InputDecoration(
                    hintText: 'Find venues or matches',
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.search, color: Colors.black26),
                  ),
                ),
              ),

              const SizedBox(height: 16),
              // two feature cards
              Row(
                children: [
                  Expanded(
                    child: AnimatedCard(
                      borderRadius: BorderRadius.circular(16),
                      padding: const EdgeInsets.all(0),
                      onTap: () => Navigator.of(context).pushNamed('/find_venue'),
                      child: _featureCardContent('Find Venue', '120+ Locations', Icons.location_on),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AnimatedCard(
                      borderRadius: BorderRadius.circular(16),
                      padding: const EdgeInsets.all(0),
                      onTap: () => Navigator.of(context).pushNamed('/find_match'),
                      child: _featureCardContent('Find Match', 'Join a Game', Icons.sports_soccer),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              // sport chips horizontal
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    const SizedBox(width: 4),
                    _sportChip('Football', selected: true),
                    const SizedBox(width: 8),
                    _sportChip('Cricket'),
                    const SizedBox(width: 8),
                    _sportChip('Tennis'),
                    const SizedBox(width: 8),
                  ],
                ),
              ),

              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Available Venues', style: TextStyle(fontWeight: FontWeight.w700)),
                  Text('See All', style: TextStyle(color: theme.colorScheme.primary)),
                ],
              ),
              const SizedBox(height: 12),
              // venues list
              Column(
                children: [
                  _venueCard('Emerald Arena', 'Downtown Sports Complex', '\$25/hr', rating: '4.8'),
                  const SizedBox(height: 12),
                  _venueCard('Velocity Courts', 'West End District', '\$18/hr', rating: '4.9'),
                  const SizedBox(height: 24),
                ],
              ),
            ],
          ),
        ),
      ),
      // Find Player tab
      const FindPlayerScreen(),
      // Tournaments tab
      const TournamentListScreen(),
      // Messages tab
      const MessagesListScreen(),
      // Profile tab
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: IndexedStack(index: _selectedIndex, children: pages),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  // (removed unused _statusChip)

  Widget _featureCardContent(String title, String subtitle, IconData icon) {
    return Container(
      height: 120,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(radius: 20, backgroundColor: const Color(0xFF0F8A66), child: Icon(icon, color: Colors.white)),
          const Spacer(),
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.black54, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _sportChip(String label, {bool selected = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: selected ? const Color(0xFF0F8A66) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: selected ? Colors.transparent : Colors.black12),
      ),
      child: Text(label, style: TextStyle(color: selected ? Colors.white : Colors.black87, fontWeight: FontWeight.w700)),
    );
  }

  Widget _venueCard(String title, String subtitle, String price, {String? rating}) {
    return AnimatedCard(
      borderRadius: BorderRadius.circular(16),
      padding: EdgeInsets.zero,
      onTap: null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: SizedBox(
              height: 140,
              width: double.infinity,
              child: Image.asset(
                'assets/images/venue_placeholder.jpg',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(color: Colors.blueGrey.shade200, child: const Center(child: Icon(Icons.photo, size: 56, color: Colors.white70))),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Text(subtitle, style: const TextStyle(color: Colors.black54)),
                      const SizedBox(height: 8),
                      Text('STARTING AT', style: TextStyle(color: Colors.black54, fontSize: 11)),
                      const SizedBox(height: 4),
                      Text(price, style: const TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
                Column(
                  children: [
                    if (rating != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6, offset: const Offset(0,4))]),
                        child: Row(children: [Text(rating, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(width: 6), const Icon(Icons.star, color: Colors.amber, size: 16)]),
                      ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pushNamed('/find_venue'),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F8A66), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: const Text('Book Now'),
                    )
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: _onNavTap,
      selectedItemColor: const Color(0xFF0F8A66),
      unselectedItemColor: Colors.black45,
      showUnselectedLabels: true,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Find Player'),
        BottomNavigationBarItem(icon: Icon(Icons.emoji_events_outlined), label: 'Tournament'),
        BottomNavigationBarItem(icon: Icon(Icons.message_outlined), label: 'Messages'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
      ],
    );
  }
}
