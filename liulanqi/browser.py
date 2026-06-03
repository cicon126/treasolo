import sys
import json
import os
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget,
    QLineEdit, QPushButton, QToolBar, QAction, QStatusBar,
    QMenu, QInputDialog, QMessageBox, QTabWidget
)
from PyQt5.QtCore import QUrl, Qt
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtGui import QIcon


class BrowserTab(QWidget):
    def __init__(self, url, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        
        self.browser = QWebEngineView()
        self.browser.setUrl(QUrl(url))
        self.layout.addWidget(self.browser)
        
        self.title = "新标签页"
        
    def get_browser(self):
        return self.browser


class SimpleBrowser(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("简易浏览器")
        self.setGeometry(100, 100, 1200, 800)
        
        self.bookmarks_file = "bookmarks.json"
        self.bookmarks = self.load_bookmarks()
        
        self.init_ui()
        
    def init_ui(self):
        self.central_widget = QWidget()
        self.layout = QVBoxLayout(self.central_widget)
        self.setCentralWidget(self.central_widget)
        
        self.toolbar = QToolBar("工具栏")
        self.toolbar.setMovable(False)
        self.addToolBar(self.toolbar)
        
        self.init_navbar()
        
        self.tabs = QTabWidget()
        self.tabs.setTabsClosable(True)
        self.tabs.tabCloseRequested.connect(self.close_tab)
        self.tabs.currentChanged.connect(self.on_tab_changed)
        self.layout.addWidget(self.tabs)
        
        self.add_new_tab()
        
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
    def init_navbar(self):
        back_btn = QAction("←", self)
        back_btn.triggered.connect(self.go_back)
        back_btn.setToolTip("后退")
        self.toolbar.addAction(back_btn)
        
        forward_btn = QAction("→", self)
        forward_btn.triggered.connect(self.go_forward)
        forward_btn.setToolTip("前进")
        self.toolbar.addAction(forward_btn)
        
        refresh_btn = QAction("⟳", self)
        refresh_btn.triggered.connect(self.refresh_page)
        refresh_btn.setToolTip("刷新")
        self.toolbar.addAction(refresh_btn)
        
        home_btn = QAction("⌂", self)
        home_btn.triggered.connect(self.go_home)
        home_btn.setToolTip("首页")
        self.toolbar.addAction(home_btn)
        
        self.toolbar.addSeparator()
        
        self.url_bar = QLineEdit()
        self.url_bar.setPlaceholderText("输入网址...")
        self.url_bar.setToolTip("地址栏")
        self.url_bar.returnPressed.connect(self.navigate_to_url)
        self.toolbar.addWidget(self.url_bar)
        
        go_btn = QAction("访问", self)
        go_btn.triggered.connect(self.navigate_to_url)
        go_btn.setToolTip("访问网址")
        self.toolbar.addAction(go_btn)
        
        self.toolbar.addSeparator()
        
        new_tab_btn = QAction("+", self)
        new_tab_btn.triggered.connect(self.add_new_tab)
        new_tab_btn.setToolTip("新建标签页")
        self.toolbar.addAction(new_tab_btn)
        
        bookmark_btn = QAction("★", self)
        bookmark_btn.triggered.connect(self.add_bookmark)
        bookmark_btn.setToolTip("添加书签")
        self.toolbar.addAction(bookmark_btn)
        
        bookmarks_menu_btn = QAction("书签", self)
        bookmarks_menu_btn.triggered.connect(self.show_bookmarks_menu)
        bookmarks_menu_btn.setToolTip("书签管理")
        self.toolbar.addAction(bookmarks_menu_btn)
        
    def get_current_browser(self):
        if self.tabs.currentWidget():
            return self.tabs.currentWidget().get_browser()
        return None
        
    def get_current_tab(self):
        return self.tabs.currentWidget()
        
    def add_new_tab(self):
        new_tab = BrowserTab("https://www.baidu.com")
        tab_index = self.tabs.addTab(new_tab, "新标签页")
        self.tabs.setCurrentIndex(tab_index)
        
        browser = new_tab.get_browser()
        browser.titleChanged.connect(lambda title, tab=new_tab: self.update_tab_title(tab, title))
        browser.urlChanged.connect(self.update_url_bar)
        browser.loadFinished.connect(self.on_load_finished)
        
    def close_tab(self, index):
        if self.tabs.count() > 1:
            self.tabs.removeTab(index)
        else:
            QMessageBox.information(self, "提示", "至少保留一个标签页")
            
    def on_tab_changed(self, index):
        browser = self.get_current_browser()
        if browser:
            self.update_url_bar(browser.url())
            
    def update_tab_title(self, tab, title):
        for i in range(self.tabs.count()):
            if self.tabs.widget(i) == tab:
                self.tabs.setTabText(i, title[:20] + "..." if len(title) > 20 else title)
                tab.title = title
                break
                
    def navigate_to_url(self):
        url = self.url_bar.text().strip()
        if not url:
            return
            
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
            
        browser = self.get_current_browser()
        if browser:
            browser.setUrl(QUrl(url))
            
    def update_url_bar(self, url):
        self.url_bar.setText(url.toString())
        
    def on_load_finished(self):
        browser = self.get_current_browser()
        if browser:
            self.status_bar.showMessage(f"已加载: {browser.url().toString()}")
            
    def go_back(self):
        browser = self.get_current_browser()
        if browser and browser.history().canGoBack():
            browser.back()
            
    def go_forward(self):
        browser = self.get_current_browser()
        if browser and browser.history().canGoForward():
            browser.forward()
            
    def refresh_page(self):
        browser = self.get_current_browser()
        if browser:
            browser.reload()
            
    def go_home(self):
        browser = self.get_current_browser()
        if browser:
            browser.setUrl(QUrl("https://www.baidu.com"))
            
    def load_bookmarks(self):
        if os.path.exists(self.bookmarks_file):
            try:
                with open(self.bookmarks_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
        
    def save_bookmarks(self):
        with open(self.bookmarks_file, 'w', encoding='utf-8') as f:
            json.dump(self.bookmarks, f, ensure_ascii=False, indent=2)
            
    def add_bookmark(self):
        browser = self.get_current_browser()
        if not browser:
            return
            
        url = browser.url().toString()
        title = browser.title()
        
        for bookmark in self.bookmarks:
            if bookmark['url'] == url:
                QMessageBox.information(self, "提示", "该页面已在收藏夹中")
                return
        
        bookmark_name, ok = QInputDialog.getText(
            self, "添加书签", "书签名称:", text=title
        )
        
        if ok and bookmark_name:
            self.bookmarks.append({
                'name': bookmark_name,
                'url': url
            })
            self.save_bookmarks()
            QMessageBox.information(self, "成功", "书签已添加")
            
    def show_bookmarks_menu(self):
        menu = QMenu(self)
        
        if not self.bookmarks:
            menu.addAction("暂无书签").setEnabled(False)
        else:
            for idx, bookmark in enumerate(self.bookmarks):
                action = menu.addAction(bookmark['name'])
                action.triggered.connect(
                    lambda checked, url=bookmark['url']: self.open_bookmark(url)
                )
                
            menu.addSeparator()
            
            delete_menu = menu.addMenu("删除书签")
            for idx, bookmark in enumerate(self.bookmarks):
                action = delete_menu.addAction(bookmark['name'])
                action.triggered.connect(
                    lambda checked, idx=idx: self.delete_bookmark(idx)
                )
        
        menu.exec_(self.cursor().pos())
        
    def open_bookmark(self, url):
        browser = self.get_current_browser()
        if browser:
            browser.setUrl(QUrl(url))
            
    def delete_bookmark(self, index):
        reply = QMessageBox.question(
            self, "确认", f"确定要删除书签 '{self.bookmarks[index]['name']}' 吗？",
            QMessageBox.Yes | QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            del self.bookmarks[index]
            self.save_bookmarks()
            QMessageBox.information(self, "成功", "书签已删除")


def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    browser = SimpleBrowser()
    browser.show()
    
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
