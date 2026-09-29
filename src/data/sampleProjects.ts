import { ProjectFile } from '../types/project';

export interface SampleProjectConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  files: ProjectFile[];
}

// 1. Primary Demo: Student Performance Prediction (Mixed Quality with Real Learning Opportunities)
const studentDatasetCSV = `student_id,age,study_hours_weekly,attendance_rate,past_failures,parent_education,internet_access,free_time,health,absences,exam_score,grade_class
S1001,16,8.5,92.0,0,higher,yes,3,4,2,88.5,A
S1002,17,4.0,84.5,1,secondary,yes,4,3,6,64.0,C
S1003,15,,78.0,0,higher,no,2,5,8,71.0,B
S1004,16,12.0,96.0,0,higher,yes,3,4,1,94.0,A
S1005,17,2.5,65.0,2,primary,yes,5,2,14,48.0,Fail
S1006,16,6.0,88.0,0,secondary,yes,3,3,4,77.5,B
S1007,15,9.0,,0,higher,yes,2,4,3,86.0,A
S1008,18,3.0,72.0,1,secondary,no,4,2,10,55.0,Fail
S1009,17,7.5,90.0,0,higher,yes,3,5,2,82.0,B
S1010,16,1.5,58.0,3,primary,no,5,1,18,39.0,Fail
S1011,15,10.0,94.0,0,higher,yes,2,4,1,91.5,A
S1012,17,5.0,81.0,0,secondary,yes,4,3,5,68.0,B
S1013,16,6.5,85.0,0,secondary,yes,3,4,4,74.0,B
S1014,18,4.5,75.0,1,primary,yes,3,3,9,59.0,C
S1015,15,11.0,98.0,0,higher,yes,2,5,0,96.0,A
S1016,16,,86.0,0,secondary,yes,4,4,3,76.0,B
S1017,17,3.5,70.0,2,secondary,no,4,2,11,51.0,Fail
S1018,15,8.0,91.0,0,higher,yes,3,4,2,84.0,A
S1019,16,5.5,83.0,0,secondary,yes,3,3,5,70.0,B
S1020,17,2.0,62.0,2,primary,yes,5,2,15,44.0,Fail
S1021,16,7.0,89.0,0,higher,yes,3,4,3,79.0,B
S1022,15,9.5,93.0,0,higher,yes,2,4,2,87.0,A
S1023,18,3.5,74.0,1,secondary,yes,4,3,8,58.0,C
S1024,16,10.5,95.0,0,higher,yes,2,5,1,92.0,A
S1025,17,4.0,79.0,1,secondary,no,4,3,7,62.0,C
S1026,15,6.0,84.0,0,secondary,yes,3,4,4,73.0,B
S1027,16,8.0,90.0,0,higher,yes,3,4,2,83.0,B
S1028,17,2.5,60.0,3,primary,no,5,2,16,42.0,Fail
S1029,15,11.5,97.0,0,higher,yes,2,5,0,95.0,A
S1030,16,5.0,82.0,0,secondary,yes,4,3,5,69.0,B
S1031,17,7.0,87.0,0,higher,yes,3,4,3,78.0,B
S1032,15,9.0,92.0,0,higher,yes,2,4,2,85.0,A
S1033,18,3.0,68.0,2,secondary,no,4,2,12,50.0,Fail
S1034,16,10.0,94.0,0,higher,yes,2,4,1,90.0,A
S1035,17,4.5,80.0,1,secondary,yes,3,3,6,65.0,C
S1036,15,6.5,85.0,0,secondary,yes,3,4,4,75.0,B
S1037,16,8.5,91.0,0,higher,yes,3,4,2,86.0,A
S1038,17,2.0,59.0,2,primary,no,5,2,17,41.0,Fail
S1039,15,12.0,98.0,0,higher,yes,2,5,0,97.0,A
S1040,16,5.5,83.0,0,secondary,yes,3,3,5,71.0,B`;

const studentNotebookJSON = {
  cells: [
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '# Student Performance Prediction Project\n',
        '**Author:** Alex Chen (Student DS Lab)\n\n',
        '### 1. Introduction & Problem Statement\n',
        'The objective of this project is to analyze factors influencing high-school student academic achievement and train machine learning classification models to identify students at risk of academic failure.',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 1,
      metadata: {},
      outputs: [],
      source: [
        'import pandas as pd\n',
        'import numpy as np\n',
        'import matplotlib.pyplot as plt\n',
        'import seaborn as sns\n',
        'import os\n',
        'from sklearn.model_selection import train_test_split\n',
        'from sklearn.preprocessing import StandardScaler\n',
        'from sklearn.ensemble import RandomForestClassifier\n',
        'from sklearn.linear_model import LogisticRegression\n',
        'from sklearn.metrics import accuracy_score\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 2,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'Loaded dataset with shape: (40, 12)\n',
        },
      ],
      source: [
        '# Load dataset\n',
        '# Note: local path used during development\n',
        'try:\n',
        '    df = pd.read_csv("C:/Users/student/downloads/student_dataset.csv")\n',
        'except Exception:\n',
        '    df = pd.read_csv("student_dataset.csv")\n',
        'print("Loaded dataset with shape:", df.shape)\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 3,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: '<class "pandas.core.frame.DataFrame">\nRangeIndex: 40 entries, 0 to 39\nData columns (total 12 columns):\n',
        },
      ],
      source: [
        '# Data Inspection & Summary\n',
        'df.head()\n',
        'df.info()\n',
        'df.describe()\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 4,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'study_hours_weekly: 2 nulls\nattendance_rate: 1 null\n',
        },
      ],
      source: [
        '# Missing value check\n',
        'print(df.isnull().sum())\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 5,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'Missing values imputed using mean strategy.\n',
        },
      ],
      source: [
        '# Clean missing data with simple mean fill\n',
        "df['study_hours_weekly'] = df['study_hours_weekly'].fillna(df['study_hours_weekly'].mean())\n",
        "df['attendance_rate'] = df['attendance_rate'].fillna(df['attendance_rate'].mean())\n",
        'print("Missing values imputed using mean strategy.")\n',
      ],
    },
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '### 2. Feature Preprocessing & Normalization\n',
        'We encode categorical columns and scale our continuous numeric features before modeling.',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 6,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'Features preprocessed and scaled.\n',
        },
      ],
      source: [
        '# Prepare feature matrix X and target y\n',
        "features = ['age', 'study_hours_weekly', 'attendance_rate', 'past_failures', 'free_time', 'health', 'absences']\n",
        'X = df[features]\n',
        "y = df['grade_class']\n\n",
        '# Scale numerical features\n',
        '# POTENTIAL LEAKAGE: Fit on full X before train/test split\n',
        'scaler = StandardScaler()\n',
        'X_scaled = scaler.fit_transform(X)\n',
        'print("Features preprocessed and scaled.")\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 7,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'Train shape: (32, 7), Test shape: (8, 7)\n',
        },
      ],
      source: [
        '# Train Test Split\n',
        '# Notice: Missing random_state parameter\n',
        'X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.20)\n',
        'print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")\n',
      ],
    },
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '### 3. Model Training & Comparison\n',
        'We train a Random Forest ensemble model and a Logistic Regression baseline model.',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 8,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'Models trained successfully.\n',
        },
      ],
      source: [
        '# Model 1: Random Forest Classifier\n',
        'rf_model = RandomForestClassifier(n_estimators=100, random_state=42)\n',
        'rf_model.fit(X_train, y_train)\n\n',
        '# Model 2: Logistic Regression Baseline\n',
        'lr_model = LogisticRegression(max_iter=500)\n',
        'lr_model.fit(X_train, y_train)\n',
        'print("Models trained successfully.")\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 9,
      metadata: {},
      outputs: [
        {
          output_type: 'stream',
          text: 'Random Forest Accuracy: 0.875\nLogistic Regression Accuracy: 0.750\n',
        },
      ],
      source: [
        '# Model Evaluation\n',
        'rf_preds = rf_model.predict(X_test)\n',
        'lr_preds = lr_model.predict(X_test)\n\n',
        'rf_acc = accuracy_score(y_test, rf_preds)\n',
        'lr_acc = accuracy_score(y_test, lr_preds)\n\n',
        'print(f"Random Forest Accuracy: {rf_acc:.3f}")\n',
        'print(f"Logistic Regression Accuracy: {lr_acc:.3f}")\n',
      ],
    },
    {
      cell_type: 'code',
      execution_count: 14, // Out of order execution!
      metadata: {},
      outputs: [],
      source: [
        '# Feature Importance visualization\n',
        'importances = rf_model.feature_importances_\n',
        'plt.figure(figsize=(8, 4))\n',
        'plt.bar(features, importances)\n',
        'plt.title("Random Forest Feature Importance")\n',
        'plt.xticks(rotation=45)\n',
        'plt.show()\n',
      ],
    },
    {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '### 4. Discussion & Conclusion\n',
        'The Random Forest model attained 87.5% test accuracy, outperforming the logistic regression baseline. Study hours and attendance were identified as the strongest predictors. In future iterations, we plan to acquire more student observations and explore hyperparameter optimization.',
      ],
    },
  ],
  metadata: {
    kernelspec: {
      display_name: 'Python 3 (ipykernel)',
      language: 'python',
      name: 'python3',
    },
  },
  nbformat: 4,
  nbformat_minor: 4,
};

export const SAMPLE_PROJECTS: SampleProjectConfig[] = [
  {
    id: 'student-performance',
    name: 'Student Performance Prediction',
    badge: 'Recommended Demo',
    description:
      'Realistic student data science assignment containing genuine strengths (EDA, model comparison, documentation) alongside subtle real-world pitfalls (scaler leakage, missing random_state, raw accuracy evaluation, hardcoded path).',
    files: [
      {
        name: 'student_project.ipynb',
        size: 14800,
        type: 'notebook',
        content: JSON.stringify(studentNotebookJSON, null, 2),
      },
      {
        name: 'student_dataset.csv',
        size: 4200,
        type: 'dataset',
        content: studentDatasetCSV,
      },
    ],
  },
  {
    id: 'customer-churn',
    name: 'Customer Churn Predictor',
    badge: 'High Leakage Scenario',
    description:
      'Telecom customer retention project with high target class imbalance (9:1), fit_transform leakage, and missing cross-validation.',
    files: [
      {
        name: 'churn_analysis.ipynb',
        size: 11200,
        type: 'notebook',
        content: JSON.stringify({
          cells: [
            {
              cell_type: 'markdown',
              source: ['# Customer Churn Classification\nPredicting subscription cancellation.'],
            },
            {
              cell_type: 'code',
              execution_count: 1,
              source: [
                'import pandas as pd\n',
                'from sklearn.preprocessing import StandardScaler\n',
                'from sklearn.ensemble import RandomForestClassifier\n',
                'from sklearn.metrics import accuracy_score\n',
                'from sklearn.model_selection import train_test_split\n',
                'df = pd.read_csv("telecom_churn.csv")\n',
                'X = df.drop(columns=["churn", "customer_id"])\n',
                'y = df["churn"]\n',
                'scaler = StandardScaler()\n',
                'X_scaled = scaler.fit_transform(X)\n',
                'X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.25)\n',
                'clf = RandomForestClassifier().fit(X_train, y_train)\n',
                'print("Accuracy:", accuracy_score(y_test, clf.predict(X_test)))\n',
              ],
            },
          ],
        }),
      },
      {
        name: 'telecom_churn.csv',
        size: 2100,
        type: 'dataset',
        content:
          'customer_id,monthly_charges,total_charges,tenure_months,contract_type,churn\nC001,75.5,1200,16,monthly,0\nC002,110.0,4400,40,annual,0\nC003,24.0,240,10,monthly,0\nC004,89.0,89,1,monthly,1\nC005,65.0,1950,30,annual,0\nC006,95.0,285,3,monthly,1\nC007,45.0,900,20,annual,0\nC008,105.0,5250,50,annual,0\nC009,70.0,70,1,monthly,1\nC010,55.0,1650,30,annual,0',
      },
    ],
  },
  {
    id: 'housing-regression',
    name: 'Housing Price Benchmark',
    badge: 'Clean Pipeline Reference',
    description:
      'Exemplary regression project demonstrating proper Pipeline encapsulation, cross-validation, and residual analysis.',
    files: [
      {
        name: 'housing_model.ipynb',
        size: 13500,
        type: 'notebook',
        content: JSON.stringify({
          cells: [
            {
              cell_type: 'markdown',
              source: ['# California Housing Valuation\nReproducible modeling pipeline with cross-validation.'],
            },
            {
              cell_type: 'code',
              execution_count: 1,
              source: [
                'import pandas as pd\n',
                'from sklearn.model_selection import train_test_split, KFold, cross_val_score\n',
                'from sklearn.pipeline import Pipeline\n',
                'from sklearn.preprocessing import StandardScaler\n',
                'from sklearn.ensemble import GradientBoostingRegressor\n',
                'from sklearn.linear_model import LinearRegression\n',
                'from sklearn.metrics import mean_squared_error, r2_score\n',
                'df = pd.read_csv("housing.csv")\n',
                'df.info()\n',
                'X = df.drop(columns=["median_house_value"])\n',
                'y = df["median_house_value"]\n',
                'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n',
                'pipe = Pipeline([("scaler", StandardScaler()), ("gb", GradientBoostingRegressor(random_state=42))])\n',
                'cv = KFold(n_splits=5, shuffle=True, random_state=42)\n',
                'scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="r2")\n',
                'print("CV R2:", scores.mean())\n',
                'pipe.fit(X_train, y_train)\n',
                'print("Test R2:", r2_score(y_test, pipe.predict(X_test)))\n',
              ],
            },
            {
              cell_type: 'markdown',
              source: ['### Conclusion\nThe pipeline achieved solid generalization without data leakage.'],
            },
          ],
        }),
      },
      {
        name: 'housing.csv',
        size: 1800,
        type: 'dataset',
        content:
          'longitude,latitude,housing_median_age,total_rooms,total_bedrooms,population,median_income,median_house_value\n-122.23,37.88,41,880,129,322,8.3252,452600\n-122.22,37.86,21,7099,1106,2401,8.3014,358500\n-122.24,37.85,52,1467,190,496,7.2574,352100\n-122.25,37.85,52,1274,235,558,5.6431,341300\n-122.25,37.84,52,1627,280,565,3.8462,342200',
      },
    ],
  },
];
