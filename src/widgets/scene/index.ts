/* The outside of this widget needs three things and nothing else: the scene itself,
   its soundtrack player, and the day/night phase App uses to follow the sky into
   dark mode. The thirteen figure components, the cycle clock and the landscape
   maths stay internal — that is what lets them be rearranged without a ripple. */
export { DayNightScene } from "@/widgets/scene/ui/DayNightScene";
export { SceneMusic } from "@/widgets/scene/ui/SceneMusic";
export { useDayNightCycle } from "@/widgets/scene/model/useDayNightCycle";
