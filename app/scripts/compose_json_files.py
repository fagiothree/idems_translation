import json
import os


def create_list(input_name, subfolders = []):
    input_list = []
    dirpath = app_path + input_name + '/'
    for file_name in os.listdir(dirpath):
        if os.path.isfile(os.path.join(dirpath, file_name)):
            json_file = json.load(open(dirpath + file_name, encoding='utf-8'))
            input_list.append(json_file)
    
    
    for subf in subfolders:
        for file_name in os.listdir(dirpath + subf + "/"):
            if os.path.isfile(os.path.join(dirpath + subf + "/", file_name)):
                json_file = json.load(open(dirpath+ subf + "/" + file_name, encoding='utf-8'))
                input_list.append(json_file)
            

    with open(output_folder + '/input_' + input_name + '.json', 'w', encoding='utf-8') as json_file:
        json.dump(input_list, json_file, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    output_folder = './input'

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)


    app_path = "../../parenting-app-ui/packages/app-data/sheets/"
    create_list("data_list", ["campaign_rows"])
    create_list("global")
    create_list("template")
    create_list("tour")
