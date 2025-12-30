import torch

from fastapi import FastAPI


app = FastAPI()
device = torch.device("mps")

# Visualize results using matplotlib
def test_model(model, loader, pre_trained_path, num_images=12):
    model.load_state_dict(torch.load(pre_trained_path))
    model.eval()

    with torch.no_grad():
        for i, (inputs, labels) in enumerate(loader):
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)

            _, preds = torch.max(outputs, 1)



