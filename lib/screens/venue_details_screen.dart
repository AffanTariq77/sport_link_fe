import 'package:flutter/material.dart';
import '../widgets/sport_illustrations.dart';

class VenueDetailsScreen extends StatelessWidget {
  final String title;
  final VenueType venueType;
  final String location;
  final int price;

  const VenueDetailsScreen({
    super.key,
    required this.title,
    required this.venueType,
    required this.location,
    required this.price,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0F14),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  AspectRatio(
                    aspectRatio: 9 / 12,
                    child: VenueIllustration(type: venueType),
                  ),
                  Positioned(
                    left: 16,
                    top: 12,
                    child: GestureDetector(
                      onTap: () => Navigator.of(context).pop(),
                      child: Container(
                        width: 38,
                        height: 38,
                        decoration: const BoxDecoration(
                          color: Color(0xAA081121),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.arrow_back,
                            color: Colors.white, size: 20),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 16,
                    top: 12,
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: const BoxDecoration(
                        color: Color(0xAA081121),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.share_outlined,
                          color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
              Container(
                transform: Matrix4.translationValues(0, -18, 0),
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
                decoration: const BoxDecoration(
                  color: Color(0xFF0D1423),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 30,
                              fontWeight: FontWeight.w700,
                              height: 1.05,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          '\$$price',
                          style: const TextStyle(
                            color: Color(0xFF2FA4FF),
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const Text(
                          '/hr',
                          style: TextStyle(
                            color: Color(0xFF7F8FAE),
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Color(0xFFFFC83D), size: 16),
                        const SizedBox(width: 4),
                        const Text('4.9',
                            style: TextStyle(color: Color(0xFFFFC83D), fontWeight: FontWeight.w700)),
                        const SizedBox(width: 8),
                        const Text('(120+ Reviews)',
                            style: TextStyle(color: Color(0xFF6F7C97))),
                        const Spacer(),
                        Text(location,
                            style: const TextStyle(color: Color(0xFF2FA4FF), fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: const [
                        _FeatureChip('Parking'),
                        _FeatureChip('Lights'),
                        _FeatureChip('Changing Rooms'),
                        _FeatureChip('Refreshments'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'About Venue',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'This venue offers premium turf, night flood lights, and modern facilities. Ideal for football, cricket and community matches with easy access and dedicated parking.',
                      style: TextStyle(color: Color(0xFF96A3BF), height: 1.35),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Availability',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: const [
                        _TimeChip('05:00 PM', selected: true),
                        _TimeChip('06:00 PM'),
                        _TimeChip('07:00 PM'),
                        _TimeChip('08:00 PM'),
                        _TimeChip('09:00 PM'),
                        _TimeChip('10:00 PM'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Location',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: const Color(0xFF14233F),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF22314A)),
                      ),
                      alignment: Alignment.center,
                      child: const Text('Map preview',
                          style: TextStyle(color: Color(0xFF7F8FAE))),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1F78FF), Color(0xFF2FA4FF)],
                          ),
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
                          child: const Text('Book This Venue',
                              style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final String text;
  const _FeatureChip(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF172136),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF263650)),
      ),
      child: Text(text, style: const TextStyle(color: Color(0xFF9AA8C0), fontSize: 12)),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final String text;
  final bool selected;
  const _TimeChip(this.text, {this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? const Color(0xFF2FA4FF) : const Color(0xFF172136),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: selected ? const Color(0xFF2FA4FF) : const Color(0xFF263650),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: selected ? Colors.white : const Color(0xFF9AA8C0),
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}
