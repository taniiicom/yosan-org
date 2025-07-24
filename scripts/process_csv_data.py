#!/usr/bin/env python3
import csv
import json
import os
import sys
from collections import defaultdict

def create_nested_dict():
    """Create a nested defaultdict for the hierarchical structure"""
    return defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))

def process_revenue_csv(csv_file_path, year):
    """Process revenue CSV file (a files) with structure: 主管 → 款名 → 項名 → 目名"""
    result = create_nested_dict()
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        headers = reader.fieldnames
        
        # Find the amount column dynamically
        amount_key = None
        for header in headers:
            if '予算額(千円)' in header and '前年度' not in header and '比較' not in header:
                amount_key = header
                break
        
        if not amount_key:
            # Fallback to index-based approach
            amount_key = headers[9] if len(headers) > 9 else None
        
        for row in reader:
            # Extract values
            shuukan = row['主管'].strip()  # 主管
            kanmei = row['款名'].strip()   # 款名
            koumei = row['項名'].strip()   # 項名
            mokumei = row['目名'].strip()  # 目名
            
            # Convert from thousand yen to regular yen (multiply by 1000)
            if amount_key and row[amount_key]:
                try:
                    amount = int(row[amount_key]) * 1000
                except ValueError:
                    amount = 0
            else:
                amount = 0
            
            # Build nested structure and aggregate values for duplicate entries
            if mokumei in result[shuukan][kanmei][koumei]:
                result[shuukan][kanmei][koumei][mokumei] += amount
            else:
                result[shuukan][kanmei][koumei][mokumei] = amount
    
    # Convert defaultdict to regular dict
    return convert_defaultdict_to_dict(result)

def process_expenditure_csv(csv_file_path, year):
    """Process expenditure CSV file (b files) with structure: 所管 → 組織 → 目名"""
    result = create_nested_dict()
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        headers = reader.fieldnames
        
        # Find the amount column dynamically
        amount_key = None
        for header in headers:
            if ('年度要求額(千円)' in header or '年度予算額(千円)' in header) and '前年度' not in header and '比較' not in header:
                amount_key = header
                break
        
        if not amount_key:
            # Fallback to index-based approach
            amount_key = headers[11] if len(headers) > 11 else None
        
        for row in reader:
            # Extract values
            shokan = row['所管'].strip()   # 所管
            soshiki = row['組織'].strip()  # 組織
            mokumei = row['目名'].strip()  # 目名
            
            # Convert from thousand yen to regular yen (multiply by 1000)
            if amount_key and row[amount_key]:
                try:
                    amount = int(row[amount_key]) * 1000
                except ValueError:
                    amount = 0
            else:
                amount = 0
            
            # Build nested structure and aggregate values for duplicate entries
            if mokumei in result[shokan][soshiki]:
                result[shokan][soshiki][mokumei] += amount
            else:
                result[shokan][soshiki][mokumei] = amount
    
    # Convert defaultdict to regular dict
    return convert_defaultdict_to_dict(result)

def convert_defaultdict_to_dict(d):
    """Convert nested defaultdict to regular dict"""
    if isinstance(d, defaultdict):
        d = dict(d)
        for key, value in d.items():
            d[key] = convert_defaultdict_to_dict(value)
    return d

def process_year(year, base_dir=None):
    """Process both revenue and expenditure files for a given year"""
    print(f"Processing year {year}...")
    
    # Use provided base directory or default to current project structure
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # File paths
    raw_data_path = os.path.join(base_dir, "front", "src", "data", "raw", f"DL{year}11001")
    revenue_csv = os.path.join(raw_data_path, f"DL{year}11001a.csv")
    expenditure_csv = os.path.join(raw_data_path, f"DL{year}11001b.csv")
    
    # Output directory
    output_dir = os.path.join(base_dir, "front", "src", "data", "japan", str(year))
    os.makedirs(output_dir, exist_ok=True)
    
    # Process revenue data
    if os.path.exists(revenue_csv):
        print(f"  Processing revenue data: {revenue_csv}")
        try:
            revenue_data = process_revenue_csv(revenue_csv, year)
            with open(os.path.join(output_dir, "revenue.json"), 'w', encoding='utf-8') as f:
                json.dump(revenue_data, f, ensure_ascii=False, indent=2)
            print(f"  Created: {os.path.join(output_dir, 'revenue.json')}")
        except Exception as e:
            print(f"  Error processing revenue data: {e}")
    else:
        print(f"  Revenue CSV not found: {revenue_csv}")
    
    # Process expenditure data
    if os.path.exists(expenditure_csv):
        print(f"  Processing expenditure data: {expenditure_csv}")
        try:
            expenditure_data = process_expenditure_csv(expenditure_csv, year)
            with open(os.path.join(output_dir, "expenditure.json"), 'w', encoding='utf-8') as f:
                json.dump(expenditure_data, f, ensure_ascii=False, indent=2)
            print(f"  Created: {os.path.join(output_dir, 'expenditure.json')}")
        except Exception as e:
            print(f"  Error processing expenditure data: {e}")
    else:
        print(f"  Expenditure CSV not found: {expenditure_csv}")

def main():
    """Process specified years or default range"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Process CSV budget data to JSON format')
    parser.add_argument('--years', nargs='+', type=int, help='Specific years to process')
    parser.add_argument('--range', nargs=2, type=int, help='Year range to process (start end)')
    parser.add_argument('--base-dir', help='Base directory of the project')
    
    args = parser.parse_args()
    
    # Determine years to process
    if args.years:
        years = args.years
    elif args.range:
        years = range(args.range[0], args.range[1] + 1)
    else:
        # Default to all available years
        years = list(range(2011, 2026))
    
    print(f"Processing years: {list(years)}")
    
    for year in years:
        try:
            process_year(year, args.base_dir)
        except Exception as e:
            print(f"Error processing year {year}: {e}")
    
    print("Processing complete!")

if __name__ == "__main__":
    main()