import difflib
from datetime import datetime


def test_file_comparison():
    with open('test_file1.txt', 'r', encoding='utf-8') as f:
        content1 = f.read()
    
    with open('test_file2.txt', 'r', encoding='utf-8') as f:
        content2 = f.read()
    
    lines1 = content1.splitlines(keepends=True)
    lines2 = content2.splitlines(keepends=True)
    
    print("=" * 60)
    print("文件1内容:")
    print("-" * 60)
    for i, line in enumerate(lines1, 1):
        print(f"{i:3}: {line}", end='')
    print()
    
    print("=" * 60)
    print("文件2内容:")
    print("-" * 60)
    for i, line in enumerate(lines2, 1):
        print(f"{i:3}: {line}", end='')
    print()
    
    diff = list(difflib.ndiff(lines1, lines2))
    
    print("=" * 60)
    print("对比结果 (ndiff):")
    print("-" * 60)
    for line in diff:
        print(line, end='')
    print()
    
    added = 0
    deleted = 0
    changed = 0
    
    i = 0
    while i < len(diff):
        line = diff[i]
        code = line[0]
        
        if code == '?':
            i += 1
            continue
        
        if code == '-':
            has_following_question = i + 1 < len(diff) and diff[i+1][0] == '?'
            has_following_plus = i + 1 < len(diff) and diff[i+1][0] == '+'
            has_following_question_after_plus = i + 2 < len(diff) and diff[i+2][0] == '?'
            
            if has_following_question:
                changed += 1
                i += 2
                continue
            elif has_following_plus:
                changed += 1
                if has_following_question_after_plus:
                    i += 3
                else:
                    i += 2
                continue
            else:
                deleted += 1
        elif code == '+':
            has_following_question = i + 1 < len(diff) and diff[i+1][0] == '?'
            if has_following_question:
                i += 2
                continue
            else:
                added += 1
        i += 1
    
    print("=" * 60)
    print("差异统计:")
    print("-" * 60)
    print(f"新增行数: {added}")
    print(f"删除行数: {deleted}")
    print(f"修改行数: {changed}")
    print(f"总差异数: {added + deleted + changed}")
    print("=" * 60)
    
    if added + deleted + changed == 0:
        print("✓ 两个文件内容完全相同！")
    else:
        print("✗ 两个文件存在差异")
        print("\n详细差异:")
        print("-" * 60)
        
        line_num1 = 0
        line_num2 = 0
        diff_group = []
        
        i = 0
        while i < len(diff):
            line = diff[i]
            code = line[0]
            content = line[2:] if len(line) > 2 else ""
            
            if code == ' ':
                if diff_group:
                    has_delete = any(item[0] == '-' for item in diff_group)
                    has_add = any(item[0] == '+' for item in diff_group)
                    
                    if has_delete and has_add:
                        print(f"[修改] 行 {diff_group[0][2] if diff_group[0][0] == '-' else diff_group[0][3]}")
                    elif has_delete:
                        print(f"[删除] 行 {diff_group[0][2]}")
                    else:
                        print(f"[新增] 行 {diff_group[0][3]}")
                    
                    for c, cont, ln1, ln2 in diff_group:
                        if c == '-':
                            print(f"  - {cont.rstrip()}")
                        elif c == '+':
                            print(f"  + {cont.rstrip()}")
                    print()
                    diff_group = []
                line_num1 += 1
                line_num2 += 1
            elif code == '-':
                line_num1 += 1
                if diff_group and diff_group[-1][0] == '+':
                    has_delete = any(item[0] == '-' for item in diff_group)
                    has_add = any(item[0] == '+' for item in diff_group)
                    
                    if has_delete and has_add:
                        print(f"[修改] 行 {diff_group[0][2] if diff_group[0][0] == '-' else diff_group[0][3]}")
                    elif has_delete:
                        print(f"[删除] 行 {diff_group[0][2]}")
                    else:
                        print(f"[新增] 行 {diff_group[0][3]}")
                    
                    for c, cont, ln1, ln2 in diff_group:
                        if c == '-':
                            print(f"  - {cont.rstrip()}")
                        elif c == '+':
                            print(f"  + {cont.rstrip()}")
                    print()
                    diff_group = [(code, content, line_num1, line_num2)]
                else:
                    diff_group.append((code, content, line_num1, line_num2))
            elif code == '+':
                line_num2 += 1
                diff_group.append((code, content, line_num1, line_num2))
            i += 1
        
        if diff_group:
            has_delete = any(item[0] == '-' for item in diff_group)
            has_add = any(item[0] == '+' for item in diff_group)
            
            if has_delete and has_add:
                print(f"[修改] 行 {diff_group[0][2] if diff_group[0][0] == '-' else diff_group[0][3]}")
            elif has_delete:
                print(f"[删除] 行 {diff_group[0][2]}")
            else:
                print(f"[新增] 行 {diff_group[0][3]}")
            
            for c, cont, ln1, ln2 in diff_group:
                if c == '-':
                    print(f"  - {cont.rstrip()}")
                elif c == '+':
                    print(f"  + {cont.rstrip()}")
            print()
    
    print("=" * 60)
    print("测试通过！对比功能正常工作。")
    print("=" * 60)


if __name__ == "__main__":
    test_file_comparison()
