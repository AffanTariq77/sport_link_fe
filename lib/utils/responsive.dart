import 'package:flutter/widgets.dart';

class Breakpoints {
  static const double small = 360; // phones
  static const double medium = 768; // tablets
  static const double large = 1024; // desktop
}

enum DeviceType { phone, tablet, desktop }

DeviceType deviceType(MediaQueryData mq) {
  final w = mq.size.width;
  if (w >= Breakpoints.large) return DeviceType.desktop;
  if (w >= Breakpoints.medium) return DeviceType.tablet;
  return DeviceType.phone;
}

extension ResponsivePadding on BuildContext {
  EdgeInsets pagePadding() {
    final t = deviceType(MediaQuery.of(this));
    switch (t) {
      case DeviceType.desktop:
        return const EdgeInsets.symmetric(horizontal: 48.0, vertical: 20);
      case DeviceType.tablet:
        return const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16);
      default:
        return const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12);
    }
  }
}
