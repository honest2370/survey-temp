-- ============================================================
-- PersonaForge Complete Schema v2
-- Includes admin, notifications, templates, global settings
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- GLOBAL SETTINGS (admin-managed, applies to all users)
-- ============================================================
CREATE TABLE IF NOT EXISTS global_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);

-- ============================================================
-- USER PROFILES (populated on first save)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    country TEXT,
    country_code VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    total_sections_filled INTEGER DEFAULT 0,
    api_key_override TEXT,
    notes TEXT
);

-- ============================================================
-- SUBMISSIONS (stores full persona JSON per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS persona_submissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    country TEXT,
    country_code VARCHAR(3),
    currency VARCHAR(10),
    responses JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS (admin -> users)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info', -- info, warning, error, success
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = all users
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- ============================================================
-- TEMPLATES (saved field collections)
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 1: PERSONAL DEMOGRAPHICS (Q52-Q100)
-- ============================================================
CREATE TABLE IF NOT EXISTS personal_demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    gender VARCHAR(50), marital_status VARCHAR(50), sexual_orientation VARCHAR(50),
    num_household INTEGER, num_children_under_18 INTEGER, num_adults_18_plus INTEGER,
    ages_of_children TEXT, has_dependents BOOLEAN, is_primary_decision_maker BOOLEAN, is_head_of_household BOOLEAN,
    relationship_status VARCHAR(100), primary_language VARCHAR(100), other_languages TEXT,
    nationality VARCHAR(100), immigration_status VARCHAR(100),
    born_in_uk BOOLEAN, years_in_uk INTEGER, years_at_current_address INTEGER,
    own_or_rent VARCHAR(20), property_type VARCHAR(50), num_bedrooms INTEGER, num_bathrooms NUMERIC(3,1),
    has_garden BOOLEAN, has_garage BOOLEAN, has_driveway BOOLEAN, approx_home_value DECIMAL(12,2),
    has_mortgage BOOLEAN, monthly_mortgage_rent DECIMAL(10,2), plan_to_move_12_months BOOLEAN,
    height_cm NUMERIC(5,1), weight_kg NUMERIC(5,1), shoe_size VARCHAR(10), clothing_size VARCHAR(10),
    wears_glasses_contacts BOOLEAN, handedness VARCHAR(15), has_disabilities BOOLEAN,
    long_term_health_conditions TEXT, disability_equality_act BOOLEAN, blood_type VARCHAR(5),
    registered_to_vote BOOLEAN, political_party VARCHAR(100), voted_last_election BOOLEAN,
    brexit_vote VARCHAR(20), political_views VARCHAR(30),
    num_cars INTEGER, has_uk_driving_licence BOOLEAN, primary_transport VARCHAR(50),
    pets TEXT, num_pets INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: EMPLOYMENT & CAREER (Q101-Q170)
-- ============================================================
CREATE TABLE IF NOT EXISTS employment_career (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    employment_status VARCHAR(50), years_in_current_role NUMERIC(4,1), years_with_employer NUMERIC(4,1),
    job_title VARCHAR(200), department VARCHAR(200), industry VARCHAR(200), primary_job_function VARCHAR(200),
    work_from_home VARCHAR(20), wfh_days_per_week INTEGER, hybrid_working BOOLEAN,
    working_hours_type VARCHAR(30), hours_per_week NUMERIC(4,1), works_overtime BOOLEAN,
    commute_distance_miles NUMERIC(5,1), commute_time_minutes INTEGER, commute_method VARCHAR(100),
    trade_union_member BOOLEAN, has_company_pension BOOLEAN, has_private_health_insurance BOOLEAN, work_benefits TEXT,
    job_satisfaction INTEGER, looking_for_job BOOLEAN, likely_to_change_jobs INTEGER,
    annual_salary DECIMAL(10,2), hourly_rate DECIMAL(8,2), receives_bonuses BOOLEAN, total_annual_compensation DECIMAL(10,2),
    involved_in_purchasing BOOLEAN, purchasing_authority VARCHAR(100), purchasing_budget DECIMAL(10,2),
    influences_it_purchasing BOOLEAN, influences_marketing_purchasing BOOLEAN, influences_hr_purchasing BOOLEAN,
    work_software_tools TEXT, uses_company_laptop BOOLEAN, uses_company_mobile BOOLEAN, work_os VARCHAR(50),
    project_mgmt_tools TEXT, crm_software VARCHAR(100), accounting_software VARCHAR(100),
    uses_cloud_computing BOOLEAN, cloud_services TEXT,
    manages_team BOOLEAN, num_direct_reports INTEGER, seniority_level VARCHAR(50), years_professional_experience INTEGER,
    professional_certifications TEXT, professional_bodies TEXT, attended_conferences BOOLEAN,
    has_linkedin BOOLEAN, linkedin_frequency VARCHAR(30), been_made_redundant BOOLEAN, been_self_employed BOOLEAN,
    does_freelance BOOLEAN, has_second_job BOOLEAN,
    org_legal_structure VARCHAR(50), org_publicly_traded BOOLEAN, org_stock_symbol VARCHAR(20),
    org_annual_turnover DECIMAL(15,2), org_profit_margin NUMERIC(5,2), org_num_locations INTEGER,
    org_international BOOLEAN, org_num_countries INTEGER, org_primary_market VARCHAR(200), org_main_competitors TEXT,
    org_has_esg_policy BOOLEAN, org_offers_apprenticeships BOOLEAN, org_nps INTEGER,
    would_recommend_employer BOOLEAN, org_glassdoor_rating NUMERIC(3,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: EDUCATION (Q171-Q210)
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    highest_education_level VARCHAR(100), degree_subject VARCHAR(200), university_attended VARCHAR(200),
    graduation_year INTEGER, russell_group BOOLEAN, has_postgraduate BOOLEAN, has_professional_qualification BOOLEAN,
    currently_studying BOOLEAN, current_study_subject VARCHAR(200), study_full_or_part_time VARCHAR(20),
    plan_further_education BOOLEAN, has_student_loan_debt BOOLEAN, student_loan_amount DECIMAL(10,2),
    completed_apprenticeship BOOLEAN, online_courses TEXT,
    has_gcses BOOLEAN, num_gcses INTEGER, has_a_levels BOOLEAN, a_level_subjects TEXT,
    has_nvqs BOOLEAN, has_btecs BOOLEAN, private_or_state_school VARCHAR(20),
    attended_grammar_school BOOLEAN, free_school_meals BOOLEAN, first_in_family_university BOOLEAN,
    children_in_education BOOLEAN, children_school_type VARCHAR(50), pays_private_tuition BOOLEAN,
    children_education_spend DECIMAL(10,2), uses_educational_apps BOOLEAN,
    uk_education_rating INTEGER, has_teaching_qualifications BOOLEAN, has_taught BOOLEAN,
    foreign_languages_fluent TEXT, typing_speed_wpm INTEGER, it_certifications TEXT,
    first_aid_courses BOOLEAN, has_dbs_check BOOLEAN, stem_graduate BOOLEAN, received_scholarship BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: FINANCE & BANKING (Q211-Q310)
-- ============================================================
CREATE TABLE IF NOT EXISTS finance_banking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    main_bank VARCHAR(100), multiple_bank_accounts BOOLEAN, banks_used TEXT,
    uses_online_banking BOOLEAN, uses_mobile_banking BOOLEAN, bank_check_frequency VARCHAR(30),
    has_current_account BOOLEAN, has_savings_account BOOLEAN, savings_amount DECIMAL(12,2),
    has_isa BOOLEAN, isa_type VARCHAR(50), has_fixed_rate_savings BOOLEAN,
    has_premium_bonds BOOLEAN, has_investments BOOLEAN, investment_types TEXT,
    investment_platform VARCHAR(100), total_investments_value DECIMAL(12,2),
    risk_tolerance VARCHAR(10), has_financial_adviser BOOLEAN, uses_robo_adviser BOOLEAN,
    has_pension BOOLEAN, pension_type VARCHAR(50), pension_pot_amount DECIMAL(12,2), planned_retirement_age INTEGER,
    has_credit_card BOOLEAN, num_credit_cards INTEGER, credit_card_providers TEXT, credit_card_limit DECIMAL(10,2),
    pays_credit_card_full BOOLEAN, credit_score VARCHAR(20), checked_credit_score BOOLEAN,
    credit_reference_agency VARCHAR(30), has_outstanding_loans BOOLEAN, loan_types TEXT,
    total_debt_excl_mortgage DECIMAL(12,2), uses_bnpl BOOLEAN, been_in_debt_management BOOLEAN,
    declared_bankruptcy BOOLEAN, has_overdraft BOOLEAN, overdraft_frequency VARCHAR(30),
    budgets_monthly BOOLEAN, budgeting_apps TEXT,
    weekly_groceries_spend DECIMAL(8,2), monthly_utilities_spend DECIMAL(8,2),
    monthly_entertainment_spend DECIMAL(8,2), monthly_clothing_spend DECIMAL(8,2),
    monthly_dining_out_spend DECIMAL(8,2), monthly_transport_spend DECIMAL(8,2), monthly_childcare_spend DECIMAL(8,2),
    sends_remittances BOOLEAN, money_transfer_service VARCHAR(50), has_foreign_currency_accounts BOOLEAN,
    has_store_cards BOOLEAN, store_cards_list TEXT, uses_contactless BOOLEAN, uses_mobile_wallet VARCHAR(100),
    uses_paypal BOOLEAN, paypal_frequency VARCHAR(30), uses_p2p_payment VARCHAR(50),
    owns_crypto BOOLEAN, crypto_types TEXT, crypto_investment DECIMAL(10,2), crypto_exchange VARCHAR(100), has_digital_wallet BOOLEAN,
    receives_government_benefits TEXT, receives_child_benefit BOOLEAN, receives_tax_credits BOOLEAN, receives_state_pension BOOLEAN,
    donates_to_charity BOOLEAN, annual_charity_donation DECIMAL(10,2), uses_gift_aid BOOLEAN,
    has_will BOOLEAN, has_power_of_attorney BOOLEAN, has_life_insurance BOOLEAN, life_insurance_amount DECIMAL(12,2),
    has_critical_illness_cover BOOLEAN, has_income_protection BOOLEAN,
    home_insurance_type VARCHAR(30), home_insurance_provider VARCHAR(100),
    has_car_insurance BOOLEAN, car_insurance_type VARCHAR(30), car_insurance_provider VARCHAR(100),
    has_pet_insurance BOOLEAN, has_travel_insurance BOOLEAN, has_private_health_insurance BOOLEAN, has_dental_insurance BOOLEAN,
    annual_insurance_spend DECIMAL(10,2), uses_price_comparison VARCHAR(50), made_insurance_claim BOOLEAN,
    has_help_to_buy_isa BOOLEAN, is_first_time_buyer BOOLEAN, owns_buy_to_let INTEGER, num_properties_owned INTEGER,
    invests_in_reits BOOLEAN, used_equity_release BOOLEAN, estimated_net_worth DECIMAL(14,2),
    has_emergency_fund BOOLEAN, emergency_fund_months INTEGER, used_payday_loan BOOLEAN, uses_cashback_websites TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: TECHNOLOGY & DEVICES (Q311-Q420)
-- ============================================================
CREATE TABLE IF NOT EXISTS technology_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    smartphone_brand VARCHAR(50), smartphone_model VARCHAR(100), phone_os VARCHAR(20),
    last_phone_purchase_date VARCHAR(50), phone_price DECIMAL(8,2), phone_bought_outright BOOLEAN,
    mobile_network_provider VARCHAR(50), monthly_mobile_bill DECIMAL(6,2), data_plan_gb INTEGER,
    has_5g_coverage BOOLEAN, uses_wifi_calling BOOLEAN,
    owns_tablet BOOLEAN, tablet_brand VARCHAR(50), owns_laptop BOOLEAN, laptop_brand VARCHAR(50),
    owns_desktop BOOLEAN, personal_computer_os VARCHAR(30),
    owns_smartwatch VARCHAR(50), owns_fitness_tracker BOOLEAN, owns_wireless_earbuds VARCHAR(50),
    owns_smart_speaker VARCHAR(50), num_smart_speakers INTEGER, uses_voice_assistant VARCHAR(50),
    has_smart_home_devices BOOLEAN, smart_home_devices_list TEXT,
    owns_doorbell_camera BOOLEAN, smart_thermostat_brand VARCHAR(30), owns_robot_vacuum BOOLEAN,
    owns_gaming_console VARCHAR(50), owns_gaming_pc BOOLEAN, monthly_gaming_spend DECIMAL(8,2),
    owns_vr_headset VARCHAR(50), owns_drone BOOLEAN, owns_ereader VARCHAR(30), owns_digital_camera BOOLEAN,
    tv_brand VARCHAR(50), tv_size_inches INTEGER, is_smart_tv BOOLEAN,
    streaming_device VARCHAR(50), has_soundbar BOOLEAN, has_home_cinema BOOLEAN,
    broadband_provider VARCHAR(50), broadband_speed_mbps INTEGER, monthly_broadband_cost DECIMAL(6,2),
    has_fibre_broadband BOOLEAN, satisfied_broadband_speed BOOLEAN,
    uses_vpn BOOLEAN, vpn_provider VARCHAR(50), has_home_printer BOOLEAN,
    daily_phone_hours NUMERIC(3,1), daily_computer_hours NUMERIC(3,1), daily_tv_hours NUMERIC(3,1),
    uses_ad_blocker BOOLEAN, uses_password_manager VARCHAR(50), online_privacy_concern INTEGER,
    cybercrime_victim BOOLEAN, identity_theft_victim BOOLEAN, uses_2fa BOOLEAN,
    password_change_frequency VARCHAR(30), reuses_passwords BOOLEAN,
    uses_cloud_storage VARCHAR(50), cloud_storage_usage_gb INTEGER, backs_up_devices BOOLEAN,
    email_provider VARCHAR(50), num_email_addresses INTEGER, daily_emails_received INTEGER,
    uses_email_filters BOOLEAN, subscribes_newsletters BOOLEAN, num_unread_emails INTEGER,
    primary_browser VARCHAR(30), uses_browser_extensions BOOLEAN, primary_search_engine VARCHAR(30),
    uses_ai_chatbots VARCHAR(100), ai_usage_frequency VARCHAR(30), ai_use_case TEXT, has_ai_concerns BOOLEAN,
    knows_programming BOOLEAN, programming_languages TEXT,
    uses_ms_office BOOLEAN, uses_google_workspace BOOLEAN, uses_zoom BOOLEAN, uses_ms_teams BOOLEAN, uses_slack BOOLEAN,
    video_call_frequency VARCHAR(30),
    uses_whatsapp BOOLEAN, uses_telegram BOOLEAN, uses_signal BOOLEAN, primary_messaging_app VARCHAR(50),
    uses_tiktok BOOLEAN, tiktok_frequency VARCHAR(30), uses_instagram BOOLEAN, instagram_frequency VARCHAR(30),
    uses_facebook BOOLEAN, facebook_frequency VARCHAR(30), uses_twitter_x BOOLEAN, uses_snapchat BOOLEAN,
    uses_youtube BOOLEAN, weekly_youtube_hours NUMERIC(5,1), uses_reddit BOOLEAN, uses_pinterest BOOLEAN,
    uses_bereal BOOLEAN, uses_threads BOOLEAN,
    creates_social_content BOOLEAN, been_influencer BOOLEAN, max_followers INTEGER,
    uses_dating_apps VARCHAR(100), social_media_professional BOOLEAN, purchased_via_social BOOLEAN,
    follows_brands_social BOOLEAN, unfollowed_blocked_brand BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: HEALTH & WELLNESS (Q421-Q510)
-- ============================================================
CREATE TABLE IF NOT EXISTS health_wellness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    overall_health VARCHAR(20), has_gp BOOLEAN, gp_visits_per_year INTEGER,
    nhs_dentist_registered BOOLEAN, dentist_visit_frequency VARCHAR(30),
    private_healthcare_provider VARCHAR(50), visited_ae_12_months BOOLEAN,
    hospitalised_12_months BOOLEAN, surgery_last_5_years BOOLEAN,
    takes_prescription_meds BOOLEAN, annual_prescription_spend DECIMAL(8,2), has_prepayment_certificate BOOLEAN,
    takes_otc_regularly BOOLEAN, takes_vitamins_supplements BOOLEAN, vitamins_list TEXT,
    has_allergies BOOLEAN, allergy_types TEXT,
    has_asthma BOOLEAN, diabetes_type VARCHAR(20), has_high_blood_pressure BOOLEAN,
    has_high_cholesterol BOOLEAN, has_heart_condition BOOLEAN, has_arthritis BOOLEAN,
    has_mental_health_conditions BOOLEAN, diagnosed_anxiety BOOLEAN, diagnosed_depression BOOLEAN,
    sought_mental_health_support BOOLEAN, used_nhs_mental_health BOOLEAN, used_private_therapy BOOLEAN,
    monthly_mental_health_spend DECIMAL(8,2),
    smoking_status VARCHAR(20), cigarettes_per_day INTEGER, uses_vape BOOLEAN, vape_brand VARCHAR(50),
    drinks_alcohol VARCHAR(20), alcohol_units_per_week NUMERIC(5,1),
    alcohol_preference VARCHAR(50), favourite_drink_brand VARCHAR(100),
    uses_recreational_drugs BOOLEAN, uses_cbd BOOLEAN,
    exercise_frequency VARCHAR(30), exercise_types TEXT, has_gym_membership BOOLEAN, gym_name VARCHAR(50),
    monthly_fitness_spend DECIMAL(8,2), uses_fitness_apps TEXT, tracks_steps BOOLEAN, avg_daily_steps INTEGER,
    participates_in_sports BOOLEAN, sports_club_memberships TEXT,
    bmi NUMERIC(4,1), trying_to_lose_weight BOOLEAN, followed_diets TEXT, is_vegetarian_or_vegan VARCHAR(20),
    dietary_requirements TEXT, meals_per_day INTEGER, eats_breakfast BOOLEAN, meal_preps BOOLEAN,
    counts_calories BOOLEAN, glasses_water_per_day INTEGER,
    hours_sleep_per_night NUMERIC(3,1), has_sleep_trouble BOOLEAN, uses_sleep_aids BOOLEAN, uses_sleep_tracker BOOLEAN,
    practices_meditation BOOLEAN, meditation_app VARCHAR(30),
    has_skincare_routine BOOLEAN, skincare_brands TEXT, monthly_skincare_spend DECIMAL(8,2),
    uses_anti_aging BOOLEAN, uses_sunscreen_daily BOOLEAN,
    visits_dermatologist BOOLEAN, skin_conditions TEXT, uses_hair_care_products BOOLEAN, shampoo_brand VARCHAR(50),
    had_cosmetic_procedures BOOLEAN, uses_contact_lenses BOOLEAN, last_eye_test_date VARCHAR(50),
    has_hearing_issues BOOLEAN, uses_hearing_aids BOOLEAN,
    had_covid19 BOOLEAN, covid_vaccinated BOOLEAN, covid_vaccine_doses INTEGER, vaccine_opinion INTEGER,
    has_long_covid BOOLEAN, has_chronic_pain BOOLEAN, uses_physiotherapy BOOLEAN, uses_chiropractic BOOLEAN,
    uses_alternative_medicine TEXT, annual_healthcare_spend DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 7: SHOPPING & CONSUMER (Q511-Q620)
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    online_shopping_frequency VARCHAR(30), monthly_online_spend DECIMAL(10,2), online_retailers TEXT,
    has_amazon_prime BOOLEAN, monthly_amazon_spend DECIMAL(8,2), uses_amazon_fresh BOOLEAN,
    uses_ebay BOOLEAN, sells_on_ebay BOOLEAN, marketplace_apps TEXT,
    primary_grocery_store VARCHAR(50), grocery_shopping_frequency VARCHAR(30),
    does_online_grocery BOOLEAN, uses_click_collect BOOLEAN, uses_grocery_delivery BOOLEAN,
    weekly_grocery_spend DECIMAL(8,2), uses_loyalty_card VARCHAR(50), uses_coupons BOOLEAN, uses_cashback_apps TEXT,
    buys_own_brand_or_branded VARCHAR(30), buys_organic BOOLEAN, buys_fairtrade BOOLEAN, buys_local BOOLEAN,
    clothing_stores TEXT, clothing_shopping_frequency VARCHAR(30), monthly_clothing_spend DECIMAL(8,2),
    buys_second_hand_clothing BOOLEAN, clothing_style VARCHAR(100), buys_luxury_brands BOOLEAN, luxury_brands_list TEXT,
    electronics_stores TEXT, furniture_stores TEXT, bought_furniture_12_months BOOLEAN, last_furniture_spend DECIMAL(8,2),
    diy_stores TEXT, home_improvements_12_months BOOLEAN, home_improvement_spend DECIMAL(10,2),
    uses_meal_kit_delivery VARCHAR(50), uses_food_delivery_apps TEXT, food_delivery_frequency VARCHAR(30),
    monthly_food_delivery_spend DECIMAL(8,2), uses_subscription_boxes BOOLEAN, subscription_box_types TEXT,
    uses_amazon_subscribe_save BOOLEAN,
    beauty_brands TEXT, beauty_stores TEXT, has_boots_advantage_card BOOLEAN, monthly_beauty_spend DECIMAL(8,2),
    fragrance_used VARCHAR(100), uses_grooming_subscription VARCHAR(50),
    cleaning_brands TEXT, buys_eco_friendly BOOLEAN, sustainability_importance INTEGER,
    reads_product_reviews BOOLEAN, review_platforms TEXT, is_which_member BOOLEAN,
    uses_price_comparison_sites BOOLEAN, price_comparison_sites TEXT, switched_energy_provider BOOLEAN,
    energy_provider VARCHAR(50), has_smart_meter BOOLEAN, has_solar_panels BOOLEAN, has_ev_charger BOOLEAN,
    energy_tariff_type VARCHAR(20), monthly_energy_bill DECIMAL(8,2),
    has_water_meter BOOLEAN, water_provider VARCHAR(50), monthly_water_bill DECIMAL(6,2),
    has_tv_licence BOOLEAN, annual_council_tax DECIMAL(8,2), council_tax_band VARCHAR(5),
    buys_lottery_tickets BOOLEAN, lottery_frequency VARCHAR(30), lottery_types TEXT,
    gambles BOOLEAN, monthly_gambling_spend DECIMAL(8,2), betting_apps TEXT,
    buys_gift_cards BOOLEAN, annual_gift_spend DECIMAL(8,2), christmas_present_spend DECIMAL(8,2),
    uses_black_friday BOOLEAN, impulse_buys BOOLEAN, preferred_payment_method VARCHAR(30),
    uses_self_checkout BOOLEAN, uses_scan_as_you_shop BOOLEAN, shops_duty_free BOOLEAN,
    buys_from_tv_shopping BOOLEAN, purchased_from_social_ads BOOLEAN, uses_discount_browser_extensions TEXT,
    uses_student_discount BOOLEAN, uses_nhs_military_discount BOOLEAN, buys_on_finance BOOLEAN, used_bnpl_6_months BOOLEAN,
    biggest_purchase_12_months TEXT, buys_extended_warranty BOOLEAN, returned_online_product BOOLEAN,
    reads_terms_conditions BOOLEAN, brand_loyalty INTEGER, recommends_products BOOLEAN,
    written_product_review BOOLEAN, participates_product_testing BOOLEAN,
    uses_reward_programs TEXT, redeems_rewards_regularly BOOLEAN,
    signed_up_free_trial BOOLEAN, cancelled_subscription BOOLEAN, uses_auto_renewal BOOLEAN,
    rents_instead_of_buying BOOLEAN, buys_refurbished_electronics BOOLEAN, buys_second_hand BOOLEAN,
    second_hand_sources TEXT, donates_to_charity_shops BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: TRAVEL & HOLIDAYS (Q621-Q720)
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    holidays_per_year INTEGER, international_holidays INTEGER, domestic_holidays INTEGER,
    holiday_preference VARCHAR(50), annual_holiday_spend DECIMAL(10,2),
    last_holiday_destination VARCHAR(200), last_holiday_date VARCHAR(50), next_planned_holiday VARCHAR(200),
    booking_method VARCHAR(30), booking_platforms TEXT, uses_travel_agent BOOLEAN,
    uses_package_holidays VARCHAR(50), accommodation_preference VARCHAR(30), hotel_star_preference VARCHAR(5),
    uses_airbnb BOOLEAN, airbnb_frequency VARCHAR(30), holiday_booking_advance VARCHAR(30),
    preferred_airlines TEXT, flight_class VARCHAR(30), has_airline_loyalty VARCHAR(50),
    has_avios BOOLEAN, flights_per_year INTEGER, has_travel_insurance BOOLEAN, travel_insurance_type VARCHAR(20),
    has_valid_passport BOOLEAN, passport_expiry VARCHAR(50), travelled_eu_since_brexit BOOLEAN,
    countries_visited INTEGER,
    travels_for_business BOOLEAN, business_travel_frequency VARCHAR(30), uses_airport_lounges VARCHAR(50),
    uses_airport_parking BOOLEAN, uses_airport_transfers BOOLEAN,
    uses_car_hire VARCHAR(50), uses_ride_hailing VARCHAR(50), uber_frequency VARCHAR(30),
    uses_public_transport_travel BOOLEAN, uses_eurostar BOOLEAN,
    been_on_cruise BOOLEAN, cruise_line VARCHAR(50), uses_caravan_motorhome BOOLEAN, goes_camping BOOLEAN,
    has_national_trust BOOLEAN, has_english_heritage BOOLEAN, visits_uk_attractions BOOLEAN,
    eating_out_on_holiday_frequency VARCHAR(30), daily_holiday_food_spend DECIMAL(8,2),
    buys_travel_accessories BOOLEAN, luggage_brand VARCHAR(50),
    travels_with_children BOOLEAN, travels_with_pets BOOLEAN, uses_pet_sitting BOOLEAN,
    buys_extra_phone_data_abroad BOOLEAN, uses_travel_money_card VARCHAR(50),
    buys_currency_before_travel BOOLEAN, currency_source VARCHAR(50),
    had_holiday_cancelled BOOLEAN, claimed_travel_compensation BOOLEAN,
    leaves_tripadvisor_reviews BOOLEAN, uses_google_maps_travel BOOLEAN, uses_translation_apps BOOLEAN,
    volunteered_abroad BOOLEAN, studied_abroad BOOLEAN, worked_abroad BOOLEAN, would_relocate_abroad BOOLEAN,
    dream_destination VARCHAR(200),
    uses_uk_trains BOOLEAN, has_railcard VARCHAR(30), train_travel_frequency VARCHAR(30),
    monthly_train_spend DECIMAL(8,2), uses_trainline_app BOOLEAN, uses_coach_services BOOLEAN,
    uses_london_underground BOOLEAN, has_oyster_or_contactless_tfl BOOLEAN, london_visit_frequency VARCHAR(30),
    uses_ferries TEXT, uses_channel_tunnel BOOLEAN,
    used_private_jet BOOLEAN, prefers_staycation_or_abroad VARCHAR(20),
    buys_last_minute_deals BOOLEAN, buys_duty_free BOOLEAN, duty_free_items TEXT,
    takes_travel_medication BOOLEAN, had_medical_emergency_abroad BOOLEAN, has_ehic_ghic BOOLEAN,
    wifi_importance INTEGER, posts_holidays_social BOOLEAN, uses_travel_blogs BOOLEAN, follows_travel_influencers BOOLEAN,
    visited_theme_park TEXT, attends_music_festivals TEXT, attends_sporting_events_travel BOOLEAN,
    uses_spa_on_holiday BOOLEAN, uses_ski_resorts BOOLEAN, most_expensive_holiday DECIMAL(10,2),
    uses_all_inclusive BOOLEAN, uses_timeshare BOOLEAN, owns_second_home_abroad BOOLEAN,
    has_global_entry_tsa BOOLEAN, applied_for_etias BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 9: AUTOMOTIVE (Q721-Q800)
-- ============================================================
CREATE TABLE IF NOT EXISTS automotive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    num_vehicles_household INTEGER, primary_vehicle_make VARCHAR(50), primary_vehicle_model VARCHAR(100),
    primary_vehicle_year INTEGER, car_new_or_used VARCHAR(10), car_purchase_source VARCHAR(30),
    car_finance_type VARCHAR(20), monthly_car_payment DECIMAL(8,2), fuel_type VARCHAR(20),
    plans_to_buy_ev VARCHAR(20), ev_brand_interest VARCHAR(50), ev_barrier VARCHAR(30),
    has_home_ev_charger BOOLEAN, uses_public_ev_charging BOOLEAN, ev_charging_network VARCHAR(50),
    annual_mileage INTEGER, daily_commute_miles INTEGER, monthly_fuel_spend DECIMAL(8,2),
    fuel_purchase_location VARCHAR(50), uses_premium_fuel BOOLEAN,
    car_insurance_type VARCHAR(30), car_insurance_provider VARCHAR(50), annual_car_insurance DECIMAL(8,2),
    car_insurance_claim_5_years BOOLEAN, years_no_claims_bonus INTEGER, has_breakdown_cover VARCHAR(20),
    has_dashcam BOOLEAN, dashcam_brand VARCHAR(50), uses_sat_nav VARCHAR(30), uses_nav_app VARCHAR(30),
    has_parking_permit BOOLEAN, monthly_parking_spend DECIMAL(6,2), uses_parking_apps TEXT,
    pays_car_wash BOOLEAN, car_wash_frequency VARCHAR(30), car_service_location VARCHAR(20),
    annual_car_maintenance DECIMAL(8,2), next_mot_due VARCHAR(50), ever_failed_mot BOOLEAN,
    uses_car_accessories BOOLEAN, tyre_brand VARCHAR(30), has_winter_tyres BOOLEAN,
    uses_child_car_seat BOOLEAN, car_seat_brand VARCHAR(30),
    advanced_driving_course BOOLEAN, licence_points INTEGER, accidents_5_years INTEGER,
    speeding_ticket_12_months BOOLEAN, uses_cruise_control BOOLEAN,
    has_advanced_safety_features BOOLEAN, has_carplay_android_auto BOOLEAN, tech_importance_car INTEGER,
    car_replacement_years INTEGER, next_car_purchase_plan VARCHAR(50), next_car_budget DECIMAL(10,2),
    ev_switch_reason VARCHAR(50), uses_car_sharing VARCHAR(50), ever_leased_car BOOLEAN,
    prefers_manual_or_auto VARCHAR(15), preferred_car_colour VARCHAR(30), preferred_car_type VARCHAR(30),
    car_feature_priorities TEXT, test_drives_before_buying BOOLEAN, cars_considered_before_purchase INTEGER,
    researched_online_before_car VARCHAR(50), watches_car_review_videos BOOLEAN, reads_car_magazines VARCHAR(50),
    would_buy_car_online BOOLEAN, uses_roof_rack_tow_bar BOOLEAN, tows_caravan_trailer BOOLEAN,
    car_engine_size_litres NUMERIC(3,1), fuel_economy_importance INTEGER,
    drives_for_work BOOLEAN, has_business_car_insurance BOOLEAN, claims_mileage_expenses BOOLEAN,
    rented_car_uk BOOLEAN, preferred_car_rental VARCHAR(50), uses_car_apps BOOLEAN,
    has_alloy_wheels BOOLEAN, vehicle_modified BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 10: ENTERTAINMENT & MEDIA (Q801-Q900)
-- ============================================================
CREATE TABLE IF NOT EXISTS entertainment_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    subscribes_netflix BOOLEAN, subscribes_prime_video BOOLEAN, subscribes_disney_plus BOOLEAN,
    subscribes_sky VARCHAR(50), subscribes_apple_tv BOOLEAN, subscribes_paramount BOOLEAN,
    subscribes_itvx_premium BOOLEAN, subscribes_discovery_plus BOOLEAN, subscribes_britbox BOOLEAN,
    num_streaming_services INTEGER, monthly_streaming_spend DECIMAL(8,2), primary_streaming_service VARCHAR(50),
    considering_cancelling_streaming BOOLEAN, shares_streaming_passwords BOOLEAN,
    watches_live_tv BOOLEAN, favourite_tv_channel VARCHAR(50), daily_tv_streaming_hours NUMERIC(3,1),
    preferred_tv_genre VARCHAR(50), last_tv_show_watched VARCHAR(200), last_film_watched VARCHAR(200),
    goes_to_cinema BOOLEAN, cinema_frequency VARCHAR(30), cinema_chain VARCHAR(50), has_cinema_membership VARCHAR(50),
    listens_to_music BOOLEAN, music_listening_method TEXT,
    subscribes_spotify BOOLEAN, subscribes_apple_music BOOLEAN, subscribes_amazon_music BOOLEAN,
    subscribes_youtube_music BOOLEAN, subscribes_tidal_deezer BOOLEAN,
    preferred_music_genre VARCHAR(50), attends_live_music BOOLEAN,
    concerts_attended_12_months INTEGER, concert_ticket_spend_last_year DECIMAL(8,2),
    listens_to_podcasts BOOLEAN, podcast_frequency VARCHAR(30), podcast_genres TEXT,
    favourite_podcast VARCHAR(200), podcast_platform VARCHAR(50),
    listens_to_radio BOOLEAN, radio_station VARCHAR(50),
    listens_to_audiobooks BOOLEAN, uses_audible BOOLEAN,
    reads_books BOOLEAN, books_per_year INTEGER, book_format_preference VARCHAR(30), book_genre_preference VARCHAR(50),
    book_retailers TEXT, uses_library BOOLEAN,
    reads_newspapers BOOLEAN, newspaper_name VARCHAR(50), newspaper_format VARCHAR(20),
    has_newspaper_subscription BOOLEAN, reads_magazines BOOLEAN, magazine_names TEXT,
    plays_video_games BOOLEAN, weekly_gaming_hours NUMERIC(5,1), gaming_platform TEXT, gaming_genre TEXT,
    plays_online_multiplayer BOOLEAN, game_purchase_format VARCHAR(30), monthly_game_spend DECIMAL(8,2),
    game_subscription_services TEXT, watches_esports BOOLEAN, watches_twitch BOOLEAN,
    plays_board_games BOOLEAN, plays_card_games BOOLEAN, does_puzzles BOOLEAN,
    attends_theatre BOOLEAN, theatre_frequency VARCHAR(30), visits_museums_galleries BOOLEAN,
    attends_comedy_shows BOOLEAN,
    plays_musical_instrument BOOLEAN, sings_or_in_choir BOOLEAN, does_art_crafts BOOLEAN,
    knits_or_crochets BOOLEAN, photography_hobby BOOLEAN, gardens BOOLEAN, annual_gardening_spend DECIMAL(8,2),
    cooks_as_hobby BOOLEAN, bakes BOOLEAN, watches_cooking_shows BOOLEAN, follows_food_bloggers BOOLEAN,
    collects_things BOOLEAN, collection_items TEXT, does_diy BOOLEAN,
    does_volunteering BOOLEAN, monthly_volunteering_hours NUMERIC(5,1), club_member BOOLEAN,
    plays_sports TEXT, watches_live_sports BOOLEAN, sports_watched TEXT,
    has_sky_sports BOOLEAN, has_tnt_sports BOOLEAN, has_dazn BOOLEAN,
    supports_football_team BOOLEAN, attends_live_sporting_events BOOLEAN,
    annual_sporting_ticket_spend DECIMAL(8,2), bets_on_sports BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 11: FOOD & DRINK (Q901-Q970)
-- ============================================================
CREATE TABLE IF NOT EXISTS food_drink (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    favourite_cuisine VARCHAR(50), eating_out_frequency VARCHAR(30), monthly_eating_out_spend DECIMAL(8,2),
    restaurant_type_preference VARCHAR(30), fast_food_restaurants TEXT, casual_dining_restaurants TEXT,
    fast_food_frequency VARCHAR(30), uses_restaurant_loyalty_apps BOOLEAN, uses_mcdonalds_app BOOLEAN,
    uses_restaurant_booking_apps VARCHAR(50),
    drinks_coffee BOOLEAN, cups_of_coffee_per_day NUMERIC(3,1), coffee_purchase_location VARCHAR(50),
    coffee_type VARCHAR(50), has_coffee_machine VARCHAR(50), weekly_coffee_spend DECIMAL(6,2),
    drinks_tea BOOLEAN, tea_type VARCHAR(50), tea_brand VARCHAR(50),
    drinks_fizzy_drinks BOOLEAN, soft_drink_brands TEXT, drinks_diet_versions BOOLEAN,
    drinks_energy_drinks VARCHAR(50), water_type VARCHAR(30), bottled_water_brand VARCHAR(50),
    drinks_juice_smoothies BOOLEAN, uses_protein_shakes BOOLEAN, protein_brand VARCHAR(50),
    uses_meal_replacement BOOLEAN,
    favourite_snack VARCHAR(50), crisp_brand VARCHAR(50), chocolate_brand VARCHAR(50), biscuit_brand VARCHAR(50),
    buys_premium_artisan_food BOOLEAN, shops_farmers_market BOOLEAN,
    has_food_allergy BOOLEAN, reads_food_labels BOOLEAN, nutrition_importance INTEGER,
    buys_ready_meals BOOLEAN, ready_meal_brand VARCHAR(50), cooks_from_scratch BOOLEAN,
    scratch_cooking_frequency VARCHAR(30), uses_cooking_sauces TEXT,
    buys_frozen_food BOOLEAN, frozen_food_brand VARCHAR(50), uses_plant_based_alternatives TEXT,
    monthly_alcohol_spend DECIMAL(8,2), alcohol_supermarket VARCHAR(50),
    buys_wine VARCHAR(50), wine_bottle_budget DECIMAL(5,2), buys_beer BOOLEAN, beer_brand VARCHAR(50),
    buys_spirits BOOLEAN, spirit_types TEXT, buys_non_alcoholic_alternatives BOOLEAN,
    visits_pubs BOOLEAN, pub_frequency VARCHAR(30), uses_pub_loyalty_app BOOLEAN, uses_wetherspoons_app BOOLEAN,
    tips_at_restaurants BOOLEAN, tip_percentage INTEGER,
    buys_from_independent_restaurants BOOLEAN, follows_meal_plan BOOLEAN,
    uses_recipe_apps VARCHAR(50), watches_food_content_youtube BOOLEAN,
    favourite_breakfast_cereal VARCHAR(50), bread_brand VARCHAR(50),
    buys_milk_alternatives VARCHAR(30), milk_alternative_brand VARCHAR(50),
    sweet_or_savoury_preference VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 12: OPINIONS, ATTITUDES & LIFESTYLE (Q971-Q1060)
-- ============================================================
CREATE TABLE IF NOT EXISTS opinions_lifestyle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES persona_submissions(user_id) ON DELETE CASCADE,
    life_happiness INTEGER, financial_satisfaction INTEGER,
    most_important_uk_issue VARCHAR(200), nhs_satisfaction INTEGER,
    cost_of_living_feeling VARCHAR(100), uk_economy_optimism VARCHAR(30),
    uk_right_direction BOOLEAN, immigration_policy_feeling VARCHAR(100),
    climate_change_policy_feeling VARCHAR(100),
    recycles BOOLEAN, environmental_consciousness INTEGER,
    uses_reusable_bags BOOLEAN, avoids_single_use_plastics BOOLEAN,
    reduced_meat_environment BOOLEAN, would_pay_more_sustainable BOOLEAN,
    public_transport_carbon BOOLEAN, considered_going_paperless BOOLEAN,
    participates_community BOOLEAN, feels_safe_neighbourhood BOOLEAN,
    local_area_satisfaction INTEGER, local_public_services_satisfaction INTEGER,
    trust_uk_government INTEGER, trust_social_media_data INTEGER, trust_big_tech INTEGER,
    reads_news_daily BOOLEAN, news_sources TEXT, most_trusted_news_sources TEXT,
    thinks_media_biased BOOLEAN, political_discussion_frequency VARCHAR(30),
    political_party_member BOOLEAN, signs_petitions BOOLEAN, attended_protest BOOLEAN,
    donates_political BOOLEAN, wfh_policy_feeling VARCHAR(100),
    ai_jobs_impact VARCHAR(30), concerned_data_privacy BOOLEAN,
    changed_privacy_settings BOOLEAN, reads_privacy_policies BOOLEAN, opted_out_cookies BOOLEAN,
    social_media_mental_health_harmful BOOLEAN, daily_news_minutes INTEGER,
    trusts_online_reviews BOOLEAN, influencer_purchased BOOLEAN, advertising_too_intrusive BOOLEAN,
    boycotted_brand BOOLEAN, boycott_reason VARCHAR(50),
    supports_local_businesses BOOLEAN, work_life_balance_importance INTEGER,
    stress_level VARCHAR(20), main_stress_cause VARCHAR(50), stress_management_method TEXT,
    practices_self_care BOOLEAN, weekly_hobby_hours NUMERIC(4,1),
    sets_personal_goals BOOLEAN, uses_planner_app BOOLEAN,
    morning_person_or_night_owl VARCHAR(20), typical_wake_time VARCHAR(20), typical_bed_time VARCHAR(20),
    daily_screen_time_hours NUMERIC(4,1), takes_digital_detox BOOLEAN,
    friend_socialise_frequency VARCHAR(30), family_socialise_frequency VARCHAR(30),
    socialise_preference VARCHAR(30), introvert_or_extrovert VARCHAR(20),
    religious_community BOOLEAN, religious_service_frequency VARCHAR(30), religion_importance INTEGER,
    celebrates_christmas BOOLEAN, celebrates_easter BOOLEAN, christmas_total_spend DECIMAL(8,2),
    celebrates_halloween BOOLEAN, celebrates_bonfire_night BOOLEAN,
    gives_charity_christmas BOOLEAN, buys_advent_calendar BOOLEAN, buys_easter_eggs BOOLEAN,
    celebrates_valentines BOOLEAN, valentines_spend DECIMAL(6,2), celebrates_mothers_fathers_day BOOLEAN,
    work_life_balance_feeling VARCHAR(50), experienced_burnout BOOLEAN,
    takes_all_annual_leave BOOLEAN, annual_leave_days INTEGER,
    plans_to_start_business BOOLEAN, has_side_hustle BOOLEAN,
    side_hustle_description VARCHAR(200), side_hustle_monthly_income DECIMAL(8,2),
    invests_self_improvement BOOLEAN, has_mentor BOOLEAN, is_ambitious BOOLEAN, five_year_vision TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_banned BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    ai_disabled BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50), model VARCHAR(100),
    prompt_tokens INTEGER, completion_tokens INTEGER, total_tokens INTEGER,
    latency_ms INTEGER, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_submissions_user ON persona_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_country ON persona_submissions(country);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_banned ON admin_users(is_banned);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(last_active);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE persona_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_career ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_banking ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE automotive ENABLE ROW LEVEL SECURITY;
ALTER TABLE entertainment_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_drink ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinions_lifestyle ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Submissions
CREATE POLICY "Users CRUD own submissions" ON persona_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all submissions" ON persona_submissions FOR SELECT USING (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));

-- User profiles
CREATE POLICY "Users CRUD own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all profiles" ON user_profiles FOR SELECT USING (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));
CREATE POLICY "Admins update all profiles" ON user_profiles FOR UPDATE USING (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));
CREATE POLICY "Admins insert profiles" ON user_profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));

-- Notifications
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (target_user_id IS NULL OR auth.uid() = target_user_id);
CREATE POLICY "Users update own read_at" ON notifications FOR UPDATE USING (target_user_id IS NULL OR auth.uid() = target_user_id);
CREATE POLICY "Admins CRUD notifications" ON notifications FOR ALL USING (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com')) WITH CHECK (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));

-- Templates
CREATE POLICY "Users CRUD own templates" ON templates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can read public templates" ON templates FOR SELECT USING (is_public = TRUE);

-- Global settings
CREATE POLICY "Anyone can read global settings" ON global_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage global settings" ON global_settings FOR ALL USING (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com')) WITH CHECK (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));

-- Section tables (survey_id = user_id)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['personal_demographics','employment_career','education','finance_banking','technology_devices','health_wellness','shopping_habits','travel_holidays','automotive','entertainment_media','food_drink','opinions_lifestyle']) LOOP
    EXECUTE format('CREATE POLICY "Users CRUD own %I" ON %I FOR ALL USING (auth.uid() = survey_id) WITH CHECK (auth.uid() = survey_id)', t, t);
    EXECUTE format('CREATE POLICY "Admins read all %I" ON %I FOR SELECT USING (auth.jwt() ->> ''email'' IN (''james.stones@example.com'',''honesttech237@gmail.com''))', t, t);
  END LOOP;
END $$;

-- Admin users
CREATE POLICY "Users read own admin status" ON admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage admin_users" ON admin_users FOR ALL USING (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com')) WITH CHECK (auth.jwt() ->> 'email' IN ('james.stones@example.com','honesttech237@gmail.com'));

-- AI logs
CREATE POLICY "Users read own AI logs" ON ai_generation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own AI logs" ON ai_generation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED
-- ============================================================
INSERT INTO countries (name, code, currency, locale) VALUES
('United Kingdom','GBR','GBP','en-GB'),('United States','USA','USD','en-US'),('Canada','CAN','CAD','en-CA'),
('Australia','AUS','AUD','en-AU'),('Germany','DEU','EUR','de-DE'),('France','FRA','EUR','fr-FR'),
('Italy','ITA','EUR','it-IT'),('Spain','ESP','EUR','es-ES'),('Netherlands','NLD','EUR','nl-NL'),
('Ireland','IRL','EUR','en-IE'),('New Zealand','NZL','NZD','en-NZ'),('India','IND','INR','hi-IN'),
('Japan','JPN','JPY','ja-JP'),('Brazil','BRA','BRL','pt-BR'),('South Africa','ZAF','ZAR','en-ZA'),
('Singapore','SGP','SGD','en-SG'),('UAE','ARE','AED','ar-AE'),('Sweden','SWE','SEK','sv-SE'),('Norway','NOR','NOK','no-NO')
ON CONFLICT (code) DO NOTHING;

-- Default global API key (empty, admin must set)
INSERT INTO global_settings (key, value) VALUES
('global_api_key', '{"key":"","provider":"groq","model":"llama-3.3-70b-versatile"}')
ON CONFLICT (key) DO NOTHING;
