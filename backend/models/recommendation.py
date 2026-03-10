def generate_recommendations(data: dict, risk_level: str) -> dict:
    subject = data.get("weak_subjects", "General")
    study_hours = data.get("study_hours", 5)
    sleep_hours = data.get("sleep_hours", 7)
    screen_time = data.get("screen_time", 3)
    attendance = data.get("attendance", 80)

    tips = []
    if study_hours < 4:
        tips.append("Increase daily study time to at least 4-5 hours with focused sessions.")
    if sleep_hours < 7:
        tips.append("Aim for 7-8 hours of sleep to improve memory retention and focus.")
    if screen_time > 4:
        tips.append("Reduce screen time. Use app blockers during study sessions.")
    if attendance < 75:
        tips.append("Attend all classes — missing lectures directly impacts understanding.")

    subject_tips = {
        "Math": ["Practice 10 problems daily", "Focus on formulas and derivations", "Use Khan Academy for weak topics"],
        "Physics": ["Draw diagrams for every problem", "Link theory to real-world examples", "Revise NCERT examples"],
        "Chemistry": ["Make reaction flashcards", "Practice balancing equations daily", "Group study for organic chemistry"],
        "English": ["Read an editorial daily", "Practice grammar exercises", "Write a short paragraph every day"],
        "CS": ["Code for 1 hour daily", "Solve 2 DSA problems per day", "Build a small project to apply concepts"],
        "None": ["Review all subjects evenly", "Focus on previous year question patterns"],
        "General": ["Identify your weakest chapter in each subject and revise it first"]
    }

    study_plan_days = []
    subjects = ["Math", "Physics", "Chemistry", "English", "CS"]
    for i, day in enumerate(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]):
        plan = {
            "day": day,
            "tasks": [
                f"Revise {subjects[i % len(subjects)]} – 2 hrs",
                "Take 1 practice quiz – 30 min",
                "Review notes from today's classes – 1 hr"
            ]
        }
        if day == "Saturday":
            plan["tasks"] = ["Full syllabus revision – 3 hrs", "Solve previous year questions – 2 hrs"]
        if day == "Sunday":
            plan["tasks"] = ["Rest & light reading – 1 hr", "Plan next week's schedule"]
        study_plan_days.append(plan)

    if risk_level == "High":
        tips.append("Consider joining a coaching class or finding a tutor for weak subjects.")
        tips.append("Start with easiest chapters to build confidence before tackling hard ones.")
    elif risk_level == "Medium":
        tips.append("You're on the boundary. Consistent effort for 2-3 weeks can move you to Low risk.")

    return {
        "general_tips": tips if tips else ["Keep up your consistent efforts!"],
        "subject_tips": subject_tips.get(subject, subject_tips["General"]),
        "weekly_study_plan": study_plan_days
    }
