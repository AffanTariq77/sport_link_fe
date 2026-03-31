import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _page = 0;

  void _next() {
    if (_page < 2) {
      _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease);
    } else {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
              child: Row(
                children: [
                  // logo placeholder
                  const Text(
                    'SportLink',
                    style: TextStyle(
                      color: Color(0xFF0F8A66),
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.of(context).pushReplacementNamed('/login'),
                    child: const Text('Skip', style: TextStyle(color: Colors.black54)),
                  ),
                ],
              ),
            ),

            Expanded(
              child: PageView(
                controller: _controller,
                onPageChanged: (i) => setState(() => _page = i),
                children: List.generate(3, (index) => _buildSlide(context, index)),
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 18),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (i) {
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 6),
                        width: i == _page ? 28 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: i == _page ? const Color(0xFF0F8A66) : Colors.black26,
                          borderRadius: BorderRadius.circular(8),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _next,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEA5B2C),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(_page == 2 ? 'Get Started' : 'Next', style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 8),
                          if (_page < 2) const Icon(Icons.arrow_forward, size: 18)
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Already a member? ', style: TextStyle(color: Colors.black54)),
                      GestureDetector(
                        onTap: () => Navigator.of(context).pushReplacementNamed('/login'),
                        child: Text('Log In', style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.w600)),
                      )
                    ],
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlide(BuildContext context, int index) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Expanded(
            child: Center(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 12, offset: Offset(0, 6))],
                ),
                child: Column(
                  children: [
                    // top image/map area
                    Expanded(
                      child: ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                        child: Container(
                          color: Colors.blueGrey.shade200,
                          child: Stack(
                            children: [
                              // background placeholder
                              Positioned.fill(
                                child: Container(color: Colors.green.shade700.withAlpha(77)),
                              ),

                              
                                        // slide 3 badge (tournament/ranking) and image tiles
                                        if (index == 2) ...[
                                          // right-bottom badge
                                          Positioned(
                                            right: 18,
                                            bottom: 18,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets.all(8),
                                                    decoration: BoxDecoration(color: const Color(0xFF0F8A66), borderRadius: BorderRadius.circular(12)),
                                                    child: const Icon(Icons.emoji_events, color: Colors.white, size: 18),
                                                  ),
                                                  const SizedBox(width: 10),
                                                  Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: const [
                                                      Text('LIVE RANKING', style: TextStyle(fontSize: 12, color: Colors.black54)),
                                                      Text('Top 5 Local', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                                                    ],
                                                  )
                                                ],
                                              ),
                                            ),
                                          ),

                                          // center image from design URL
                                          Positioned.fill(
                                            child: Image.network(
                                              'https://lh3.googleusercontent.com/aida-public/AB6AXuAiHDGgEDqleo_9x2W41TltYpYZUQxFugtijyV9aoRBdvVrgHu51KFc8gX6L-nTu2hmh9tcpV-m8yg1ek_FZKrZPdG5dEGPuSGPBI12O50MZTpV8aFbSV1TEcrLU6icKe32Ib-fMbNViEgOWwbTbZvW8zd6Ve4wK8qy42HPHSv07QALmsXXQ1MAGK6LP0lXx6MZO_YzT3TNs5RzFbq2mL-nnItF2ELQ2zLpzDH8gf3BntV48yHB1zFUZlyLpThM_q4mZofi11m05D5B',
                                              fit: BoxFit.cover,
                                              loadingBuilder: (context, child, progress) => progress == null ? child : const Center(child: CircularProgressIndicator()),
                                              errorBuilder: (context, error, stack) => const Center(child: Icon(Icons.broken_image, size: 56, color: Colors.white70)),
                                            ),
                                          ),

                                        ] else if (index == 1) ...[
                                          // slide 1/2 -- map-like image and player chips
                                          Positioned.fill(
                                            child: Image.network(
                                              'https://lh3.googleusercontent.com/aida-public/AB6AXuCB4Eu-XaWRlzNG4Twlpeq2wTEwj5lXX9QEvPO5rQxl6Q3XeNhx4GcS6f4BmIlnbUyiG0BPIi5vot1bnrWcLCGyhUo2nwkZpPoD3xfWH-uOfBYeU5Q7OSXLkwh8AXRpLa283hg4lHyDBsxOHLMKU6pCeMtBEAmKQTcQmKtlQdoHuuG60mwmItKHUWjEkSR4zzH2udrVsurHNAT6TvzmfpIhRpKxI5KPQkCRVDqVbtCFCD6XQsNaGhnApMaktjny0tXlhQSunAG7VXny',
                                              fit: BoxFit.cover,
                                              loadingBuilder: (context, child, progress) => progress == null ? child : const Center(child: CircularProgressIndicator()),
                                              errorBuilder: (context, error, stack) => const Center(child: Icon(Icons.broken_image, size: 56, color: Colors.white70)),
                                            ),
                                          ),

                                          // player chips over image
                                          Positioned(
                                            left: 18,
                                            top: 18,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                                              child: Row(children: const [
                                                CircleAvatar(radius: 12, backgroundColor: Colors.black12, child: Icon(Icons.person, size: 14, color: Colors.white)),
                                                SizedBox(width: 8),
                                                Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text('TENNIS • PRO', style: TextStyle(fontSize: 10, color: Colors.black54)),
                                                    Text('Marcus, 1.2km away', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                                  ],
                                                )
                                              ]),
                                            ),
                                          ),
                                          Positioned(
                                            left: 18,
                                            top: 72,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                                              child: Row(children: const [
                                                CircleAvatar(radius: 12, backgroundColor: Colors.black12, child: Icon(Icons.person, size: 14, color: Colors.white)),
                                                SizedBox(width: 8),
                                                Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text('BASKETBALL • INTERMEDIATE', style: TextStyle(fontSize: 10, color: Colors.black54)),
                                                    Text('Sarah, 0.8km away', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                                  ],
                                                )
                                              ]),
                                            ),
                                          ),
                                          Positioned(
                                            right: 28,
                                            bottom: 40,
                                            child: Column(
                                              children: [
                                                Icon(Icons.location_on, color: Colors.greenAccent.shade400, size: 28),
                                                const SizedBox(height: 6),
                                                Icon(Icons.location_on, color: Colors.greenAccent.shade400, size: 20),
                                              ],
                                            ),
                                          ),
                                          Positioned(
                                            left: 28,
                                            bottom: 28,
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(16)),
                                              child: const Text('12 PLAYERS ONLINE NOW', style: TextStyle(color: Colors.white, fontSize: 12)),
                                            ),
                                          ),

                                        ] else ...[
                                          // slide 0 - venue image
                                          Positioned.fill(
                                            child: Image.network(
                                              'https://lh3.googleusercontent.com/aida-public/AB6AXuCZAMtA6I6Qhn9AalPHJQY9uhNEYplnWvZRlVBLyYFh6ugHkh-OnD1flUNVC0IZXd1r5OLjBhH2EJ8uC19umELU95-7YYAmX6jvxvmcZa2z-nVh6_FcMEZZs7Oa0YFwl8LuouUVtIeEjY2tyCmhx0x1SdPi_1P3d_xX0OnTncVTuLcLJgWgWqXipAf7FPjnPvkq_qS6ZxuzaWa8ntGYKCGU3v000CAZPpWd9iJnHFxYDsgMLldXVeXtXumJ2eC-_8DdMIvWqsfVIDTt',
                                              fit: BoxFit.cover,
                                              loadingBuilder: (context, child, progress) => progress == null ? child : const Center(child: CircularProgressIndicator()),
                                              errorBuilder: (context, error, stack) => const Center(child: Icon(Icons.broken_image, size: 56, color: Colors.white70)),
                                            ),
                                          ),

                                        ],
                            ],
                          ),
                        ),
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
                        color: Colors.white,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          if (index == 1)
                            const Text('Players Nearby', style: TextStyle(fontWeight: FontWeight.w600))
                          else
                            const Text('Center Court Available', style: TextStyle(fontWeight: FontWeight.w600)),
                          const Icon(Icons.star, color: Colors.green, size: 18),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 18),
          if (index == 0) ...[
            const Text('Book Venues Easily', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text('Find and book premium sports venues near you with just a few taps.', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54)),
          ] else if (index == 1) ...[
            const Text('Find Players Nearby', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text('Connect with athletes in your area. Filter by skill level and sport to find your perfect match.', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54)),
          ] else ...[
            const Text('Manage Bookings', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text('See your upcoming bookings and manage cancellations easily.', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54)),
          ],
          const SizedBox(height: 18),
        ],
      ),
    );
  }
}
