# AGENT.md - AI Collaborative Guide

> **Purpose**: This document serves as a "context memory" and instruction manual for AI agents working on the Devis PMS project. Read this to understand project structure, rules, and current state.

## 须要遵循的规则

1.如何对数据库的操作，都直接将SQL一句写出来，我会拷贝去执行，不要产生批处理文件
2.总是用中文与我对话
3.数据库是MySQL8.0,密码是"a719721"
4.不是需要保留的说明都只写在总结里面，不要写MD，除非需要长期保留
5.没有我的指令，不能从GIT下载文件或上传文件。如果进行GIT提交，每次都要提交到远程仓库。 -
6. 不要用powershell的替换命令。
7. 所有的md 文件放到md文件夹中；所有的sql文件放到sql文件夹中；所有的bat文件放到bat文件夹中；所有的HTML文件放到HTML文件夹中。如果这些文件夹不存在，在根目录下创建。
8. Powershell不要用 && 命令；
9. 数据库及UI都已经设计好了；所有后台代码都应当按照UI和已经创建好的数据库来设计。
10.除了删除文件操作，其它所有操作都不需要批准。
11.所有前端界面都是设计预先设计好的，没有我的同意不能重新设计，不能删除。
12. 如果你要用的某个端口被占了，只需要停止运行在该端口的进程即可。
13. 如果你修改了JAVA程序，请通知我重启后端。你不需要自己去启动后端。