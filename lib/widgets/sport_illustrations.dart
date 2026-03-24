import 'dart:math' as math;
import 'package:flutter/material.dart';

// ─── Venue type ───────────────────────────────────────────────────────────────

enum VenueType { football, basketball, tennis, cricket }

// ─── Venue Illustration ───────────────────────────────────────────────────────

/// Renders a top-down sport venue illustration that fills its parent container.
class VenueIllustration extends StatelessWidget {
  final VenueType type;

  const VenueIllustration({super.key, required this.type});

  @override
  Widget build(BuildContext context) {
    final CustomPainter painter;
    switch (type) {
      case VenueType.football:
        painter = const _FootballFieldPainter();
        break;
      case VenueType.basketball:
        painter = const _BasketballCourtPainter();
        break;
      case VenueType.tennis:
        painter = const _TennisCourtPainter();
        break;
      case VenueType.cricket:
        painter = const _CricketGroundPainter();
        break;
    }
    return CustomPaint(
      painter: painter,
      child: const SizedBox.expand(),
    );
  }
}

// ─── Sport Avatar ─────────────────────────────────────────────────────────────

/// A circular illustrated avatar – use inside a ClipOval or CircleAvatar.
class SportAvatar extends StatelessWidget {
  /// Seed index to pick one of several colour palettes (0–5).
  final int seed;

  const SportAvatar({super.key, this.seed = 0});

  static const List<List<Color>> _palettes = [
    [Color(0xFF1A4DB5), Color(0xFF0A2A6A)], // blue
    [Color(0xFF1B7A3E), Color(0xFF0B3E1E)], // green
    [Color(0xFF6A1B9A), Color(0xFF38006B)], // purple
    [Color(0xFF9A3412), Color(0xFF4E1006)], // orange
    [Color(0xFF1565C0), Color(0xFF003C8F)], // deep blue
    [Color(0xFF00695C), Color(0xFF003D33)], // teal
  ];

  @override
  Widget build(BuildContext context) {
    final palette = _palettes[seed % _palettes.length];
    return CustomPaint(
      painter: _AvatarPainter(topColor: palette[0], bottomColor: palette[1]),
      child: const SizedBox.expand(),
    );
  }
}

// ─── Football Field Painter ──────────────────────────────────────────────────

class _FootballFieldPainter extends CustomPainter {
  const _FootballFieldPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Dark stadium background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, w, h),
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF041004), Color(0xFF08200A)],
        ).createShader(Rect.fromLTWH(0, 0, w, h)),
    );

    // Alternating grass stripes
    for (int i = 0; i < 6; i++) {
      canvas.drawRect(
        Rect.fromLTWH(0, i * h / 6, w, h / 6),
        Paint()
          ..color = i.isEven ? const Color(0xFF196120) : const Color(0xFF1E7028),
      );
    }

    // Floodlight glow from each corner
    for (final align in <Alignment>[
      Alignment.topLeft,
      Alignment.topRight,
      Alignment.bottomLeft,
      Alignment.bottomRight,
    ]) {
      canvas.drawRect(
        Rect.fromLTWH(0, 0, w, h),
        Paint()
          ..shader = RadialGradient(
            center: align,
            radius: 1.0,
            colors: const [Color(0x22FFFFCC), Color(0x00000000)],
          ).createShader(Rect.fromLTWH(0, 0, w, h)),
      );
    }

    final lw = math.max(1.0, w * 0.007);
    final wp = Paint()
      ..color = const Color(0xCCFFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = lw;

    final inset = w * 0.05;
    final top = h * 0.06;
    final bot = h * 0.94;

    // Field boundary
    canvas.drawRect(Rect.fromLTRB(inset, top, w - inset, bot), wp);
    // Centre line
    canvas.drawLine(Offset(w * 0.5, top), Offset(w * 0.5, bot), wp);
    // Centre circle
    canvas.drawCircle(Offset(w * 0.5, h * 0.5), w * 0.12, wp);
    // Centre spot
    canvas.drawCircle(
      Offset(w * 0.5, h * 0.5),
      w * 0.011,
      Paint()..color = const Color(0xCCFFFFFF),
    );

    // Left penalty area
    canvas.drawRect(
        Rect.fromLTRB(inset, h * 0.26, inset + w * 0.19, h * 0.74), wp);
    // Left 6-yard box
    canvas.drawRect(
        Rect.fromLTRB(inset, h * 0.38, inset + w * 0.09, h * 0.62), wp);
    // Right penalty area
    canvas.drawRect(
        Rect.fromLTRB(w - inset - w * 0.19, h * 0.26, w - inset, h * 0.74),
        wp);
    // Right 6-yard box
    canvas.drawRect(
        Rect.fromLTRB(w - inset - w * 0.09, h * 0.38, w - inset, h * 0.62),
        wp);

    // Goals
    final gp = Paint()
      ..color = const Color(0x99FFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = lw * 0.75;
    canvas.drawRect(
        Rect.fromLTRB(inset - w * 0.03, h * 0.43, inset, h * 0.57), gp);
    canvas.drawRect(
        Rect.fromLTRB(
            w - inset, h * 0.43, w - inset + w * 0.03, h * 0.57),
        gp);

    // Penalty spots
    final sp = Paint()..color = const Color(0xCCFFFFFF);
    canvas.drawCircle(Offset(inset + w * 0.12, h * 0.5), lw * 1.3, sp);
    canvas.drawCircle(Offset(w - inset - w * 0.12, h * 0.5), lw * 1.3, sp);

    // Corner arcs
    final ca = w * 0.028;
    canvas.drawArc(Rect.fromCircle(center: Offset(inset, top), radius: ca),
        0, math.pi / 2, false, wp);
    canvas.drawArc(
        Rect.fromCircle(center: Offset(w - inset, top), radius: ca),
        math.pi / 2, math.pi / 2, false, wp);
    canvas.drawArc(Rect.fromCircle(center: Offset(inset, bot), radius: ca),
        -math.pi / 2, math.pi / 2, false, wp);
    canvas.drawArc(
        Rect.fromCircle(center: Offset(w - inset, bot), radius: ca),
        math.pi, math.pi / 2, false, wp);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── Basketball Court Painter ─────────────────────────────────────────────────

class _BasketballCourtPainter extends CustomPainter {
  const _BasketballCourtPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Hardwood floor
    canvas.drawRect(
      Rect.fromLTWH(0, 0, w, h),
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFFC07A2A), Color(0xFF8C5418)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ).createShader(Rect.fromLTWH(0, 0, w, h)),
    );

    // Wood grain (horizontal)
    final grain = Paint()
      ..color = const Color(0x1A000000)
      ..strokeWidth = 0.8;
    for (int i = 1; i < 30; i++) {
      canvas.drawLine(
          Offset(0, i * h / 30), Offset(w, i * h / 30), grain);
    }
    // Plank separators (vertical)
    final plank = Paint()
      ..color = const Color(0x0C000000)
      ..strokeWidth = 0.5;
    for (int i = 1; i < 12; i++) {
      canvas.drawLine(
          Offset(i * w / 12, 0), Offset(i * w / 12, h), plank);
    }

    final lw = math.max(1.0, w * 0.008);
    final wp = Paint()
      ..color = const Color(0xCCFFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = lw;

    const b = 0.04;

    // Court boundary
    canvas.drawRect(Rect.fromLTRB(w * b, h * 0.04, w * (1 - b), h * 0.96), wp);
    // Centre line
    canvas.drawLine(
        Offset(w * 0.5, h * 0.04), Offset(w * 0.5, h * 0.96), wp);
    // Centre circle
    canvas.drawCircle(Offset(w * 0.5, h * 0.5), w * 0.09, wp);

    // Key / paint (reddish fill)
    final keyFill = Paint()..color = const Color(0xAAC83010);
    canvas.drawRect(
        Rect.fromLTRB(w * b, h * 0.33, w * b + w * 0.22, h * 0.67),
        keyFill);
    canvas.drawRect(
        Rect.fromLTRB(
            w * (1 - b) - w * 0.22, h * 0.33, w * (1 - b), h * 0.67),
        keyFill);
    canvas.drawRect(
        Rect.fromLTRB(w * b, h * 0.33, w * b + w * 0.22, h * 0.67), wp);
    canvas.drawRect(
        Rect.fromLTRB(
            w * (1 - b) - w * 0.22, h * 0.33, w * (1 - b), h * 0.67),
        wp);

    // Free-throw circles (half)
    canvas.drawArc(
      Rect.fromCircle(
          center: Offset(w * b + w * 0.22, h * 0.5), radius: w * 0.09),
      -math.pi / 2, math.pi, false, wp,
    );
    canvas.drawArc(
      Rect.fromCircle(
          center: Offset(w * (1 - b) - w * 0.22, h * 0.5), radius: w * 0.09),
      math.pi / 2, math.pi, false, wp,
    );

    // Three-point arcs
    canvas.drawArc(
      Rect.fromCircle(
          center: Offset(w * b + w * 0.05, h * 0.5), radius: w * 0.32),
      -math.pi * 0.42, math.pi * 0.84, false, wp,
    );
    canvas.drawArc(
      Rect.fromCircle(
          center: Offset(w * (1 - b) - w * 0.05, h * 0.5), radius: w * 0.32),
      math.pi * 0.58, math.pi * 0.84, false, wp,
    );

    // Hoops (orange rings)
    final hoop = Paint()
      ..color = const Color(0xFFFF8C00)
      ..style = PaintingStyle.stroke
      ..strokeWidth = lw * 1.8;
    canvas.drawCircle(
        Offset(w * b + w * 0.025, h * 0.5), w * 0.025, hoop);
    canvas.drawCircle(
        Offset(w * (1 - b) - w * 0.025, h * 0.5), w * 0.025, hoop);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── Tennis Court Painter ─────────────────────────────────────────────────────

class _TennisCourtPainter extends CustomPainter {
  const _TennisCourtPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Out-of-bounds (dark green)
    canvas.drawRect(
        Rect.fromLTWH(0, 0, w, h), Paint()..color = const Color(0xFF1A5030));

    // Main hard court (blue)
    canvas.drawRect(
      Rect.fromLTRB(w * 0.06, h * 0.06, w * 0.94, h * 0.94),
      Paint()..color = const Color(0xFF1A4CC0),
    );

    // Service area (slightly lighter blue)
    canvas.drawRect(
      Rect.fromLTRB(w * 0.12, h * 0.19, w * 0.88, h * 0.81),
      Paint()..color = const Color(0xFF1E56CF),
    );

    final lw = math.max(1.0, w * 0.008);
    final wp = Paint()
      ..color = const Color(0xDDFFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = lw;

    // Outer boundary
    canvas.drawRect(Rect.fromLTRB(w * 0.06, h * 0.06, w * 0.94, h * 0.94), wp);
    // Singles sidelines
    canvas.drawLine(Offset(w * 0.12, h * 0.06), Offset(w * 0.12, h * 0.94), wp);
    canvas.drawLine(Offset(w * 0.88, h * 0.06), Offset(w * 0.88, h * 0.94), wp);
    // Service lines
    canvas.drawLine(Offset(w * 0.06, h * 0.19), Offset(w * 0.94, h * 0.19), wp);
    canvas.drawLine(Offset(w * 0.06, h * 0.81), Offset(w * 0.94, h * 0.81), wp);
    // Centre service line
    canvas.drawLine(Offset(w * 0.5, h * 0.19), Offset(w * 0.5, h * 0.81), wp);
    // Baseline centre marks
    canvas.drawLine(Offset(w * 0.5, h * 0.06), Offset(w * 0.5, h * 0.11), wp);
    canvas.drawLine(Offset(w * 0.5, h * 0.89), Offset(w * 0.5, h * 0.94), wp);

    // Net shadow
    canvas.drawLine(
      Offset(w * 0.06, h * 0.5 + 2),
      Offset(w * 0.94, h * 0.5 + 2),
      Paint()
        ..color = const Color(0x55000000)
        ..strokeWidth = lw * 1.8,
    );
    // Net
    canvas.drawLine(
      Offset(w * 0.06, h * 0.5),
      Offset(w * 0.94, h * 0.5),
      Paint()
        ..color = Colors.white
        ..strokeWidth = lw * 1.5,
    );
    // Net posts
    canvas.drawCircle(
        Offset(w * 0.06, h * 0.5), 4, Paint()..color = Colors.white);
    canvas.drawCircle(
        Offset(w * 0.94, h * 0.5), 4, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── Cricket Ground Painter ───────────────────────────────────────────────────

class _CricketGroundPainter extends CustomPainter {
  const _CricketGroundPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Dark outer
    canvas.drawRect(
        Rect.fromLTWH(0, 0, w, h), Paint()..color = const Color(0xFF071507));

    // Outfield oval
    canvas.drawOval(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.5), width: w * 0.92, height: h * 0.92),
      Paint()..color = const Color(0xFF1B6420),
    );

    // Inner fielding circle (lighter)
    canvas.drawOval(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.5), width: w * 0.55, height: h * 0.55),
      Paint()..color = const Color(0xFF207226),
    );

    // Boundary rope
    canvas.drawOval(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.5), width: w * 0.9, height: h * 0.9),
      Paint()
        ..color = const Color(0xAAFFFFFF)
        ..style = PaintingStyle.stroke
        ..strokeWidth = math.max(1, w * 0.009),
    );

    // Inner circle line
    canvas.drawOval(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.5), width: w * 0.52, height: h * 0.52),
      Paint()
        ..color = const Color(0x66FFFFFF)
        ..style = PaintingStyle.stroke
        ..strokeWidth = math.max(1, w * 0.007),
    );

    // Pitch
    final pitchRRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.5),
          width: w * 0.065,
          height: h * 0.32),
      const Radius.circular(2),
    );
    canvas.drawRRect(pitchRRect, Paint()..color = const Color(0xFFD4B48C));

    // Crease lines
    final cp = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.5;
    canvas.drawLine(Offset(w * 0.45, h * 0.38), Offset(w * 0.55, h * 0.38), cp);
    canvas.drawLine(Offset(w * 0.455, h * 0.395), Offset(w * 0.545, h * 0.395), cp);
    canvas.drawLine(Offset(w * 0.45, h * 0.62), Offset(w * 0.55, h * 0.62), cp);
    canvas.drawLine(Offset(w * 0.455, h * 0.605), Offset(w * 0.545, h * 0.605), cp);

    // Stumps
    final sp = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;
    for (int i = -1; i <= 1; i++) {
      final xOff = i * w * 0.007;
      canvas.drawLine(Offset(w * 0.5 + xOff, h * 0.38),
          Offset(w * 0.5 + xOff, h * 0.35), sp);
      canvas.drawLine(Offset(w * 0.5 + xOff, h * 0.62),
          Offset(w * 0.5 + xOff, h * 0.65), sp);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── Avatar Painter ───────────────────────────────────────────────────────────

class _AvatarPainter extends CustomPainter {
  final Color topColor;
  final Color bottomColor;

  const _AvatarPainter(
      {required this.topColor, required this.bottomColor});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final cx = Offset(w / 2, h / 2);
    final r = math.min(w, h) / 2;

    // Background
    canvas.drawCircle(
      cx,
      r,
      Paint()
        ..shader = RadialGradient(
          colors: [topColor, bottomColor],
          center: const Alignment(-0.3, -0.4),
        ).createShader(Rect.fromCircle(center: cx, radius: r)),
    );

    // Neck
    canvas.drawRect(
      Rect.fromLTRB(w * 0.43, h * 0.53, w * 0.57, h * 0.63),
      Paint()..color = const Color(0xFFE8C090),
    );

    // Jersey / body (fills bottom half)
    final shirt = Path()
      ..moveTo(w * 0.18, h)
      ..lineTo(w * 0.21, h * 0.67)
      ..cubicTo(w * 0.24, h * 0.58, w * 0.39, h * 0.56, w * 0.5, h * 0.56)
      ..cubicTo(w * 0.61, h * 0.56, w * 0.76, h * 0.58, w * 0.79, h * 0.67)
      ..lineTo(w * 0.82, h)
      ..close();
    canvas.drawPath(shirt, Paint()..color = topColor.withValues(alpha: 0.9));

    // Head
    canvas.drawOval(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.39),
          width: w * 0.34,
          height: h * 0.36),
      Paint()..color = const Color(0xFFE8C090),
    );

    // Hair arc
    canvas.drawArc(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.40),
          width: w * 0.36,
          height: h * 0.38),
      math.pi * 1.07,
      math.pi * 0.86,
      false,
      Paint()
        ..color = const Color(0xFF3D2010)
        ..style = PaintingStyle.stroke
        ..strokeWidth = h * 0.055
        ..strokeCap = StrokeCap.round,
    );

    // Eyes
    final eyePaint = Paint()..color = const Color(0xFF2A1A0A);
    canvas.drawOval(
        Rect.fromCenter(
            center: Offset(w * 0.41, h * 0.40),
            width: w * 0.055,
            height: h * 0.038),
        eyePaint);
    canvas.drawOval(
        Rect.fromCenter(
            center: Offset(w * 0.59, h * 0.40),
            width: w * 0.055,
            height: h * 0.038),
        eyePaint);

    // Smile
    canvas.drawArc(
      Rect.fromCenter(
          center: Offset(w * 0.5, h * 0.44),
          width: w * 0.14,
          height: h * 0.07),
      0.25,
      math.pi * 0.55,
      false,
      Paint()
        ..color = const Color(0xFF6A3A1A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = h * 0.016
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_AvatarPainter oldDelegate) =>
      topColor != oldDelegate.topColor || bottomColor != oldDelegate.bottomColor;
}
