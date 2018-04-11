"""
Irods Python Module, wraps calls
"""


import os
from irods.session import iRODSSession

import re, json



try:
    env_file = os.environ['IRODS_ENVIRONMENT_FILE']
except KeyError:
    env_file = os.path.expanduser('~/.irods/irods_environment.json') 

session = iRODSSession(irods_env_file=env_file)


class Irods:
    """
    Parent class for helper IROD commands
    """

    def delete (self, current_path):
        """ deletes file """

        print ("delete:")
        print (current_path)

    def patch(self, current_path, json_body):
        """ rename file """

        print ("Patch:")
        print (current_path)
        print (json_body)

    def post(self, current_path):
        """ create file """

        print ("post")
        print (current_path)

    def put(self, current_path, json_body):
        """ save file """

        print(current_path)
        print(json_body)

        data = json_body
        print(data)
        print (data['content'])

        obj = session.data_objects.get(current_path)

        with obj.open('w') as f:
            f.seek(0,0);
            f.write(data['content'].encode())

        return "done"


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
                "mimetype":None,
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
                    "mimetype":None,
                    "writable":True,
                    "type":"directory"
                })
            for f in files:

                # obj = session.data_objects.get(current_path+"/"+f.name)
                # print (obj)
                # print ("hello i am a dog")

                # file_string = ""
                # with obj.open('r+') as f:
                #     f.seek(0,0)
                #     for line in f:
                #         file_string = file_string + str(line.decode('ascii'))
                

                # print ("hello dog?")
                # print (file_string)

                result['content'].append({
                    "name":f.name,
                    "path":current_path+"/"+f.name,
                    "last_modified": "2018-03-05T17:02:11.246961Z",
                    "created":"2018-03-05T17:02:11.246961Z",
                    "content": "dog food",
                    "format": "text",
                    "mimetype":"text/*",
                    "writable":False,
                    "type":"file"
                })
          
            return result
        except:            

            # try:

            obj = session.data_objects.get(current_path)

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
                "mimetype":"text/*",
                "writable":False,
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