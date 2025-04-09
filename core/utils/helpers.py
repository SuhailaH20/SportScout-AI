def print_report(player_data, prediction):
    """طباعة تقرير الأداء"""
    print("\n" + "="*50)
    print("تقرير أداء اللاعب".center(50))
    print("="*50)
    print(f"الأهداف: {player_data['Goals']}")
    print(f"التمريرات الحاسمة: {player_data['Assists']}")
    print(f"التقييم الحالي: {player_data['Seasons Ratings']:.2f}")
    print(f"التقييم المتوقع: {prediction['future_rating']:.2f}")
    print("="*50)
    
    for rec in prediction['recommendations']:
        print(f"- {rec}")