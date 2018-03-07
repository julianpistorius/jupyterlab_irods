"""
Irods Python Module, wraps calls
"""


import os
from irods.session import iRODSSession


try:
    env_file = os.environ['IRODS_ENVIRONMENT_FILE']
except KeyError:
    env_file = os.path.expanduser('~/.irods/irods_environment.json') 

session = iRODSSession(irods_env_file=env_file)


class Irods:
    """
    Parent class for helper IROD commands
    """

    def get(self, current_path):
        """
        Used to get contents of current directory
        """
        try:
            coll = session.collections.get(current_path)

            folders = coll.subcollections
            files = coll.data_objects
            result = {

                "name": "folder_name",
                "path": "folder_path",
                "last_modified": "2018-03-05T17:02:11.246961Z",
                "created":"2018-03-05T17:02:11.246961Z",
                "content":[],
                "format": "json",
                "mimetpye":None,
                "writable":True,
                "type":"directory"
            }

            for folder in folders:
                result['content'].append({
                    "name":folder.name,
                    "path":current_path+"/"+folder.name,
                    "last_modified": "2018-03-05T17:02:11.246961Z",
                    "created":"2018-03-05T17:02:11.246961Z",
                    "content":None,
                    "format": "json",
                    "mimetpye":None,
                    "writable":True,
                    "type":"directory"
                })
            for f in files:
                result['content'].append({
                    "name":f.name,
                    "path":current_path+"/"+f.name,
                    "last_modified": "2018-03-05T17:02:11.246961Z",
                    "created":"2018-03-05T17:02:11.246961Z",
                    "content": None,
                    "format": "json",
                    "mimetpye":"text/x-python",
                    "writable":True,
                    "type":"file"
                })
          

            return result
        except:            

            # try:

            print ("testing 123")
            print (current_path)
            obj = session.data_objects.get(current_path)
            print (obj)

            print ("failure")
            file_string = ""
            with obj.open('r+') as f:
                f.seek(0,0)
                for line in f:
                    file_string = file_string + str(line.decode('ascii'))
            
            return {

                "name": obj.name,
                "path": obj.name,
                "last_modified": "2018-03-05T17:02:11.246961Z",
                "created":"2018-03-05T17:02:11.246961Z",
                "content": file_string,
                "format": "text",
                "mimetpye":"text/*",
                "writable":True,
                "type":"file"
            }

            # except:
            #     return {

            #         "name": "folder_name",
            #         "path": "folder_path",
            #         "last_modified": "2018-03-05T17:02:11.246961Z",
            #         "created":"2018-03-05T17:02:11.246961Z",
            #         "content":"",
            #         "format": "json",
            #         "mimetpye":None,
            #         "writable":True,
            #         "type":"fole"
            #     }