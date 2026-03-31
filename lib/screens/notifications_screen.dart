import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Color(0xFF0F8A66)), onPressed: () => Navigator.of(context).pop()),
        title: const Text('Notifications', style: TextStyle(color: Color(0xFF0F8A66), fontWeight: FontWeight.w800)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: const [
                    SizedBox(width: 4),
                    _FilterChip(label: 'All', selected: true),
                    SizedBox(width: 8),
                    _FilterChip(label: 'Invites'),
                    SizedBox(width: 8),
                    _FilterChip(label: 'Bookings'),
                    SizedBox(width: 8),
                    _FilterChip(label: 'Tournament'),
                  ],
                ),
              ),

              const SizedBox(height: 12),
              Column(children: [
                _notificationCard(context, 'Match Invitation', 'Marcus Thorne invited you to a Padel Doubles match at Oasis Club.', time: '2m ago', isInvite: true),
                const SizedBox(height: 12),
                _notificationCard(context, 'Booking Confirmed', 'Your reservation for Court 4 - Tennis Academy is confirmed for tomorrow at 10:00 AM.', time: '15m ago'),
                const SizedBox(height: 12),
                _notificationCard(context, 'Tournament Update', 'Brackets for the City Open Summer Slam have been released. Check your first round opponent!', time: '1h ago'),
                const SizedBox(height: 12),
                _notificationCard(context, 'Payment Successful', 'A payment of \$24.00 for your match contribution has been processed successfully.', time: '4h ago'),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  Widget _notificationCard(BuildContext context, String title, String body, {required String time, bool isInvite = false}) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: const Offset(0,6))]),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w800)), Text(time, style: const TextStyle(color: Colors.black45))]),
          const SizedBox(height: 8),
          Text(body, style: const TextStyle(color: Colors.black54)),
          if (isInvite) ...[
            const SizedBox(height: 12),
            Row(children: [
              ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F8A66)), child: const Text('Accept')),
              const SizedBox(width: 12),
              OutlinedButton(onPressed: () {}, child: const Text('Decline'))
            ])
          ]
        ]),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  const _FilterChip({required this.label, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), decoration: BoxDecoration(color: selected ? const Color(0xFF0F8A66) : Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)), child: Text(label, style: TextStyle(color: selected ? Colors.white : Colors.black87)));
  }
}
