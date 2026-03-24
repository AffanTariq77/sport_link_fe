import 'package:flutter/material.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0F14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A1426),
        foregroundColor: Colors.white,
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 14),
            child: Center(
              child: Text('MARK ALL AS READ', style: TextStyle(color: Color(0xFF2FA4FF), fontSize: 11, fontWeight: FontWeight.w700)),
            ),
          )
        ],
        bottom: TabBar(
          controller: _controller,
          indicatorColor: const Color(0xFF2FA4FF),
          labelColor: const Color(0xFF2FA4FF),
          unselectedLabelColor: const Color(0xFF6B7384),
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Matches'),
            Tab(text: 'Bookings'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _controller,
        children: const [
          _NotificationList(),
          _NotificationList(),
          _NotificationList(),
        ],
      ),
    );
  }
}

class _NotificationList extends StatelessWidget {
  const _NotificationList();

  @override
  Widget build(BuildContext context) {
    final items = [
      const _NotificationItem('Match Invite',
          'Zaid K. invited you to a Football match', '2m ago', Icons.person, Color(0xFF2FA4FF)),
      const _NotificationItem('Booking Confirmed',
          'Booking confirmed at Elite Padel Club', '45m ago', Icons.check_circle, Color(0xFF2ECC71)),
      const _NotificationItem('New Tournament',
          'Champions League registration is now open', '3h ago', Icons.emoji_events, Color(0xFFFFC83D)),
      const _NotificationItem('Hurry Up!',
          'Only 1 slot left for the Cricket match', '5h ago', Icons.flash_on, Color(0xFFFF4757)),
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemBuilder: (context, index) {
        final item = items[index];
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF131B2D),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF22314A)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: item.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(item.icon, color: item.color, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 3),
                    Text(item.message, style: const TextStyle(color: Color(0xFF8FA0BF), fontSize: 12)),
                  ],
                ),
              ),
              Text(item.timeAgo, style: const TextStyle(color: Color(0xFF6B7384), fontSize: 11)),
            ],
          ),
        );
      },
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemCount: items.length,
    );
  }
}

class _NotificationItem {
  final String title;
  final String message;
  final String timeAgo;
  final IconData icon;
  final Color color;

  const _NotificationItem(
      this.title, this.message, this.timeAgo, this.icon, this.color);
}
